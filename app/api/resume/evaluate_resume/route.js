import { sendOpenAi } from "@/libs/gpt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";


export async function POST(req) {

    const data = await req.formData();
    const resume = data.get('resume');
    const job_description = data.get('job_description');
    
    const profile_id = data.get('profile_id'); // Need to make sure I have this
    const resume_id = data.get('resume_id'); // Need to make sure I have this
    console.log('Resume:', resume);
    console.log('json resume:', resume);

    // Instantiate connection with Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const user_id = session?.user?.id


    const get_key_words = 'You are a highly skilled recruiter consultant.' +
     'Your task is to create a list of keywords that are relevant to the job description.' +
     'The job description is as follows: ' + job_description + 
     '. Please provide a list of keywords that are relevant to the job description. That would be used by an ATS (application tracking system)'+
     'Use only keywords that would be found in a resume and would be useful when trying to screen resumes. '+
     'The keywords should be separated by commas. '+
     'For example, if the job description is "The ideal candidate will have experience with Python, Java, and C++", '+
     'the keywords would be "Python, Java, C++". Please use only keywords relevant to Experience, Work History, Skills and Competencies'+
     'do not include keywords that are irrelevant such as 401k, PTO, perks'+
     'Also do not limit your self to words from the job description, but expand the list using your own judgement for words that would be useful given the role.'
     ;

    const get_resume_feedback = 
     'FOR CONTEXT HERE IS THE RESUME IN JSON STRUCTURE: ' + resume + 
     '----------' +
     'FOR CONTEXT HERE IS THE JOB DESCRIPTION: ' + job_description +
     '----------'+
     'You are a highly skilled recruiter consultant.'+
     'Please evaluate the resume against the given job description, '+
     'Create 5 relevant categories based on the job description to evaluate the candidate on. '+
    //  'on these categories Experience and Work History; Skills and Competencies; '+
    //  'Education and Qualifications; Achievements and Accomplishments; Cultural Fit.'+
     'Please score the candidate on each of these categories on a scale from 1 to 5. Be very strict with your scoring. '

    const keyword_message = {'role': 'user', 'content': get_key_words};
    const feedback_message = {'role': 'user', 'content': get_resume_feedback};

    let key_words_response, feedback_response;
    try {
        key_words_response = await sendOpenAi([keyword_message], 'default_user', 400, 0.1);
        feedback_response = await sendOpenAi([feedback_message], 'default_user', 400, 0.1);

    } catch (error) {
        console.error('Error sending message to OpenAI:', error);
        return new NextResponse('Error sending message to OpenAI', { status: 500 });
    }

    const response = {
        'key_words': key_words_response,
        'feedback': feedback_response
    };
    console.log('Response:', response);


    try {
        const {status, error} = await supabase
        .from('job_scans')
        .insert([{
          user_id: user_id,
          resume_id: resume_id,
          job_description: job_description,
          keywords: key_words_response,
          job_analysis: feedback_response
          }
        ]);
        if (error) {
            console.error('Error inserting into Supabase:', error);
            throw error;
        }
    }
    catch (error) {
        console.error('Error inserting into Supabase:', error);
        return new NextResponse('Error inserting into Supabase', { status: 500 });
    }

    //TODO might need to fix something here and use the data from the backend instead of the raw response.
    return new NextResponse(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}