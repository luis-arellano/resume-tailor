import { sendOpenAi } from "@/libs/gpt";
import { NextResponse } from "next/server";


//  NOT READY FOR PRODUCTION YET- PLUS MIGHT NEED TO BE MIGRATED TO PYTHON CLOUD RUN.
export async function POST(req) {

    const formData = await req.formData();
    const resume = formData.get('resume');
    const keywords = formData.get('keywords');
    const job_description = formData.get('job_description');
    const experience = JSON.parse(resume)['Experience'];


    let analyze_resp;
    let rewrite_message;
    let rewrite_resp;

    const analyze_prompt = `You are a highly skilled resume analyzer and writer.
        Your speciality is analyzing keywords matching resumes with job descriptions, using best practices.
        --JOB DESCRIPTION: ${job_description}

        ---------------------
        Please consider the following:
        -What is Target Job Title or Target Roles from the job description, and can we adjust the resume job titles with
        similar variations to match the jobs description?
        -What soft skills are used the most in this job that we should feature in the resume?
        -What hard skills are used the most in this job that we should feature in the resume?
        -What easter eggs are there that we could put in a resume that showed that we researched and read it, 
        and used the company language? An easter egg is something that is very specific to the language 
        that this company is using that is highly unique, that we can also use to match how they talk about their company.
        -What metrics or KPIs are used in this job that we should be sure to feature.
        -Brainstorm a couple powerful sample bullet points to use on a resume using action verbs, quantifiable metrics, and using the same language as the job description.
        -Any Other thoughts or questions about the keyword pattern you notice in this job description that 
        will be relevant for the resume?

        YOUR ANSWER:`;

    

    function rewrite_prompt(experience, job_description, analysis) {
        return `You are a highly skilled resume analyzer and writer.
                You work for the candidate and your task is to rewrite the resume to most effectively match the job description.
                You are also provided an job description analysis that you should use when rewriting the resume.
                
                ORIGINAL RESUME: ${resume}
                ---------------------
                JOB DESCRIPTION: ${job_description}
                ---------------------
                KEYWORDS: ${keywords}
                ---------------------
                ANALYSIS: ${analysis}
                ---------------------
                INSTRUCTIONS:
                -First consider the provided analysis for how to rewrite the resume.
                -You can rewrite entire bullet points to adjust grammar, style, and overall fit the job description as suggested by the analysis.
                -Readjust the order of the bullets in order or relevance to the job description.
                -Feel free to add new bullets to match the suggestions from the analysis. Make sure each new bullet 
                folows best practices from resume writing such as using action verbs, quantifiable metrics, and using the same language as the job description.
                'Use placeholders metrics for candidate to fill in (eg. Improved resenue by <X>,...,  reduced costs by <Y>, etc.)  

                Provide your response in the following JSON format:
                {
                    "rewritten_resume": {
                        // The rewritten resume content following the original JSON structure
                    },
                    "rationale": string
                    // The rationale for your suggested changes along with any thoughts regarding weaknesses in the resume.
                    // for example missing skills, irrelevant experience, gaps in employment history,
                }

                Ensure your response is a valid JSON object.
                YOUR ANSWER:`;
        }


    try{
        let analyze_message = {'role': 'user', 'content': analyze_prompt};
        analyze_resp = await sendOpenAi([analyze_message], 'default_user', 2000, 0.1);
        console.log('ANALYZE RESPONSE:', analyze_resp);

        rewrite_message = {'role': 'user', 'content': rewrite_prompt(JSON.stringify(experience), job_description, analyze_resp)};
        rewrite_resp = await sendOpenAi([rewrite_message], 'default_user', 3000, 0.5);


        console.log('ORIGINAL EXPERIENCE:', JSON.stringify(experience));
        console.log('REWRITE RESPONSE:', rewrite_resp);

    } catch(error){
        console.error('Error sending message to OpenAI:', error);
        return new NextResponse('Error sending message to OpenAI', { status: 500 }); 
    }
    
    const response = {rewrite_resp: rewrite_resp, resume:resume}

    return new NextResponse(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });

}