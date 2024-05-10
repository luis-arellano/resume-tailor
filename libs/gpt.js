import axios from "axios";


export const RESUME_SCHEMA = `
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "ContactInformation": {
      "type": "object",
      "properties": {
        "Name": { "type": "string" },
        "Bio": {"type": "string"}
        "Email": { "type": "string", "format": "email" },
        "Phone": { "type": "string" },
        "Location": { "type": "string" }
      },
      "required": ["Name", "Email"]
    },
    "Skills": {
      "type": "array",
      "items": { "type": "string" }
    },
    "Languages": {
      "type": "array",
      "items": { "type": "string" }
    },
    "Education": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "Degree": { "type": "string" },
          "School": { "type": "string" },
          "Duration": { "type": "string" }
        },
        "required": ["Degree", "School", "Duration"]
      }
    },
    "Experience": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "Title": { "type": "string" },
          "Company": { "type": "string" },
          "Duration": { "type": "string" },
          "Overview": { "type": "string" },
          "Responsibilities": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["Title", "Company", "Duration"]
      }
    },
    "Certifications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "Name": { "type": "string" },
          "IssuingOrganization": { "type": "string" },
          "DateReceived": { "type": "string" }
        },
        "required": ["Name", "IssuingOrganization"]
      }
    },
    "OtherInformation": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["ContactInformation", "Skills", "Education", "Experience"]
}
`



// Use this if you want to make a call to OpenAI GPT-4 for instance. userId is used to identify the user on openAI side.
export const sendOpenAi = async (messages, userId, max = 100, temp = 1) => {
  const url = "https://api.openai.com/v1/chat/completions";

  console.log("Ask GPT >>>");
  messages.map((m) =>
    console.log(" - " + m.role.toUpperCase() + ": " + m.content)
  );

  const body = JSON.stringify({
    model: "gpt-3.5-turbo-1106",
    messages,
    max_tokens: max,
    temperature: temp,
    user: userId,
  });

  const options = {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.post(url, body, options);

    const answer = res.data.choices[0].message.content;
    const usage = res?.data?.usage;

    console.log(">>> " + answer);
    console.log(
      "TOKENS USED: " +
        usage?.total_tokens +
        " (prompt: " +
        usage?.prompt_tokens +
        " / response: " +
        usage?.completion_tokens +
        ")"
    );
    console.log("\n");

    return answer;
  } catch (e) {
    console.error("GPT Error: " + e?.response?.status, e?.response?.data);
    return null;
  }
};
