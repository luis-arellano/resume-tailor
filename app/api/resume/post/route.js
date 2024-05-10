import { NextResponse } from "next/server";
import { promises as fs } from 'fs'; // To save the file temporarily
import { v4 as uuidv4 } from 'uuid'; // To generate a unique filename
import PDFParser from 'pdf2json'; // To parse the pdf
import { sendOpenAi } from "@/libs/gpt";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { RESUME_SCHEMA } from "@/libs/gpt";

export async function POST(req) {

    console.log('RECEIVED REQUEST: ');
    const data = await req.formData();
    const uploadedFiles = data.getAll('resume');
    let fileName = '';
    let parsedText = '';

    if (uploadedFiles && uploadedFiles.length > 0) {
        const uploadedFile = uploadedFiles[0];
        console.log('Uploaded file:', uploadedFile);

        if (uploadedFiles) {
            // Generate a unique filename
            fileName = uuidv4();
      
            // Convert the uploaded file into a temporary file
            const tempFilePath = `/tmp/${fileName}.pdf`;
      
            // Convert ArrayBuffer to Buffer
            const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
      
            // Save the buffer as a file
            await fs.writeFile(tempFilePath, fileBuffer);
      
            // Parse the pdf using pdf2json. See pdf2json docs for more info.
      
            // The reason I am bypassing type checks is because
            // the default type definitions for pdf2json in the npm install
            // do not allow for any constructor arguments.
            // You can either modify the type definitions or bypass the type checks.
            // I chose to bypass the type checks.
            const pdfParser = new (PDFParser )(null, 1);


            // Instantiate connection with Supabase
            const cookieStore = cookies();
            const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const user_id = session?.user?.id

      
            return new Promise((resolve, reject) => {
                pdfParser.on('pdfParser_dataError', errData => {
                    console.error(errData.parserError);
                    resolve(new NextResponse('Error processing PDF', { status: 500 }));
                });
    
                pdfParser.on('pdfParser_dataReady', async () => {
                    const parsedText = pdfParser.getRawTextContent();
                    // const instructions = 'Please extract the following information from the attached resume: contact_information, name, email, phone, location; experience (including company, title, Duration in dates, overview, responsibilities); Education (Degree, school, duration); Skills, Languages, Other information. Structure your response In Json';
                    const instructions = `Summarize the text provided into a JSON with the following structure ${RESUME_SCHEMA}`
                    const message = { role: 'user', content: parsedText + ' ' + instructions };
                    console.log('INSTRUCTIONS FOR LLM: ', message);
    
                    try {
                        const llmResponse = await sendOpenAi([message], 'default_user', 4000, 0.1);
                        console.log('LLM Response:', llmResponse);
                        let jsonLlmResponse = JSON.parse(llmResponse);

                        // Save to Supabase
                        const {status, error} = await supabase
                          .from('resumes')
                          .insert([{
                            user_id: user_id,
                            file_name: fileName,
                            resume_data: jsonLlmResponse
                            }
                          ]);
                        console.log('SUPABASE STATUS: ', status);
                        console.log('SUPABASE error: ', error);
                        if (error) {
                          console.error('Error inserting into Supabase:', error);
                          throw error;
                        }

                        const response = new NextResponse(JSON.stringify(llmResponse));
                        response.headers.set('FileName', fileName);
                        response.headers.set('Content-Type', 'application/json');
                        resolve(response);
                    } catch (error) {
                        console.error('Error calling LLM:', error);
                        resolve(new NextResponse('Error calling LLM', { status: 500 }));
                    }
                });
                pdfParser.loadPDF(tempFilePath);
             }); 
        } else {
          console.log('Uploaded file is not in the expected format.');
        }
      } else {
        console.log('No files found.');
        return new NextResponse('No files found.', { status: 400 });
      }
    }
