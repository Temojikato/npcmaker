const openAI = require("openai");

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");

exports.getnpc = onCall((request) => {

    // if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
    //   // Throwing an HttpsError so that the client gets the error details.
    //   throw new HttpsError("invalid-argument", "The function must be called " +
    //           "with two arguments \"firstNumber\" and \"secondNumber\" which " +
    //           "must both be numbers.");
    // }

    const Configuration = openAI.Configuration;
    const OpenAIApi = openAI.OpenAIApi;
    functions.logger.log(request);
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    if (!configuration.apiKey) {
        return ({
          message: "OpenAI API key not configured, please follow instructions in README.md",
        });
    }

    return new Promise(async (resolve, reject) => {
        try {
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: generatePromptNPC(request.data),
                temperature: 0.3,
                max_tokens: 1000
            })
            return (resolve({ result: completion.data.choices[0].text }));
        } catch (error) {
            // Consider adjusting the error handling logic for your use case
            if (error.response) {
                console.error(error.response.status, error.response.data);
                res.status(error.response.status).json(error.response.data);
                return (reject(res))
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                res.status(500).json({
                    error: error.message
                })
                return (reject(res))
            }
        }
    });
  });

function isNotEmpty(input) {
    return (input != "" && input != undefined)
}

function generatePromptNPC(info) {
    var wInfoString = ""
    if (isNotEmpty(info.wInfo))
        wInfoString = ": " + info.wInfo;
    else
        wInfoString = "is unknown to me."

    var nameString = ""
    if (isNotEmpty(info.cName))
        nameString = "The character's name is : " + info.cName
    else
        nameString = "Please think of a name for my character."
    
    var contextString = ""
    if (isNotEmpty(info.cContext))
        contextString = "A bit of context about their life : " + info.cContext
    else
        contextString = "Please think of some context for the character, like parents, friends and pets."

    var backstoryString = ""
    if (isNotEmpty(info.cBackstory))
        backstoryString = "The character's backstory : " + info.cBackstory
    else
        backstoryString = "Please think of a proper backstory for this character, like some big events they went through."
    
    var expertiseString = ""
    if (isNotEmpty(info.cExpertise))
        expertiseString = "They are experts at : " + info.cExpertise
    else
        expertiseString = "Please think of some expertise for this character."

    var classString = ""
    if (isNotEmpty(info.cClass))
        classString = "The character's class and/or profession is " + info.cClass
    else
        classString = "Please think of a class and/or profession for this character."
    
    var personalityString = ""
    if (isNotEmpty(info.cPersonality))
        personalityString = "Some personality traits for this character: " + info.cPersonality
    else
        personalityString = "Please think of some personality traits for this character."
    
    var looksString = ""
    if (isNotEmpty(info.cLooks))
        looksString = "The character's looks : " + info.cLooks
    else
        looksString = "Please think of what this character would physically look like."
    

    const prompt = `
    I need to create a character for my tabletop RPG game. Here is some info about the character:
    The world the character lives in ${wInfoString}
    ${nameString}
    ${contextString}
    ${backstoryString}
    ${expertiseString}
    ${classString}
    ${personalityString}
    ${looksString}

    Please answer all these questions for me and deliver it as a nice story of around 1000 words.
    `
    console.log(prompt);
    return prompt;
}