import { NextResponse } from "next/server";
import { promises as fs } from 'fs'; // To save the file temporarily
import { v4 as uuidv4 } from 'uuid'; // To generate a unique filename
import PDFParser from 'pdf2json'; // To parse the pdf
import { sendOpenAi } from "@/libs/gpt";

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
      
            // See pdf2json docs for more info on how the below works.
            pdfParser.on('pdfParser_dataError', (errData) =>
              console.log(errData.parserError)
            );
      
            pdfParser.on('pdfParser_dataReady', async () => {
              // console.log((pdfParser as any).getRawTextContent());
              parsedText = (pdfParser).getRawTextContent();
              const instructions = 'Please extract the following information from the attached resume:   1. Contact information, Name, Email, Phone, Location.  2. Experience  (including company, title, description, responsibilities, Duration in dates, ) 3. Education (Degree, school, duration)  4. Skills, Languages, Other information. Structure your response In Json';
              const message = {role:'user', content: parsedText+' '+instructions}
              console.log(' INSTRUCTIONS FOR LLM: ', message);
              const llm_response = await sendOpenAi([message], 'default_user', 4000, 0.1)
              console.log(llm_response);
            });
            pdfParser.loadPDF(tempFilePath);
        } else {
          console.log('Uploaded file is not in the expected format.');
        }
      } else {
        console.log('No files found.');
      }

      const response = new NextResponse(parsedText);
      response.headers.set('FileName', fileName);
      return response;
    }

    // if(!file || file.type !== 'application/pdf'){
    //     NextResponse.json({ error: "No PDF file provided or wrong file type." }, { status: 400 });
    // }

    // try {
    //     const bytes = await file.arrayBuffer();
    //     const buffer = Buffer.from(bytes);
    //     console.log('content: ', buffer);

    // }
    // catch(error){
    //     console.error('Error parsing PDF: ', error);
    //     return NextResponse.json({ error: 'failed to parse pdf'}, { status: 500 });
    // }
    
// }