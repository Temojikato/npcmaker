const openAI = require("openai");

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.getnpc = onCall((request) => {
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

function isEmpty(input) {
    return (input == "")
}

function isUsed(input) {
    return (input == "generate")
}

function generatePromptNPC(info) {
    var wInfoString = "The world the character lives in "
    if (isEmpty(info.wInfo))
        wInfoString = "is unknown to me."
    else if (isUsed(input))
        wInfoString = ": " + info.wInfo;
    else
        wInfoString = ""

    var nameString = ""
    if (isEmpty(info.cName))
        nameString = "Please think of a name for my character."
    else if (isUsed(input))
        nameString = "The character's name is : " + info.cName
    else
        nameString = "Please don't give the character a name, just refer to them as they/them."

    var contextString = ""
    if (isEmpty(info.cContext))
        contextString = "Please think of some context for the character, like parents, friends and pets."
    else if (isUsed(input))
        contextString = "A bit of context about their life : " + info.cContext

    var backstoryString = ""
    if (isEmpty(info.cBackstory))
        backstoryString = "Please think of a proper backstory for this character, like some big events they went through."
    else if (isUsed(input))
        backstoryString = "The character's backstory : " + info.cBackstory

    var expertiseString = ""
    if (isEmpty(info.cExpertise))
        expertiseString = "Please think of some expertise for this character."
    else if (isUsed(input))
        expertiseString = "They are experts at : " + info.cExpertise

    var classString = ""
    if (isEmpty(info.cClass))
        classString = "Please think of a class and/or profession for this character."
    else if (isUsed(input))
        classString = "The character's class and/or profession is " + info.cClass

    var personalityString = ""
    if (isEmpty(info.cPersonality))
        personalityString = "Please think of some personality traits for this character."
    else if (isUsed(input))
        personalityString = "Some personality traits for this character: " + info.cPersonality

    var looksString = ""
    if (isEmpty(info.cLooks))
        looksString = "Please think of what this character would physically look like."
    else if (isUsed(input))
        looksString = "The character's looks : " + info.cLooks


    const prompt = `
    I need to create a character for my tabletop RPG game. Here is some info about the character:
    ${wInfoString}
    ${nameString}
    ${contextString}
    ${backstoryString}
    ${expertiseString}
    ${classString}
    ${personalityString}
    ${looksString}

    Please answer all these questions for me and deliver it as a nicely laid out story of around 500 words split into the given categories.
    `
    console.log(prompt);
    return prompt;
}