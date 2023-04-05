const openAI = require("openai");

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { json } = require("express");

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

function needsGen(input) {
    return (input == "generate")
}

function isUsed(input) {
    return (input != "" && input != undefined && input != "generate")
}

function generatePromptNPC(info) {
    var wInfoString = "The world the character lives in "
    if (needsGen(info.wInfo))
        wInfoString += "is unknown to me."
    else if (isUsed(info.wInfo))
        wInfoString += ": " + info.wInfo;
    else
        wInfoString = ""

    var nameString = ""
    if (needsGen(info.cName))
        nameString = "Please think of a name for my character."
    else if (isUsed(info.cName))
        nameString = "The character's name is : " + info.cName
    else
        nameString = "Please don't give the character a name, just refer to them as they/them."

    var contextString = ""
    if (needsGen(info.cContext))
        contextString = "Please think of some context for the character, like parents, friends and pets."
    else if (isUsed(info.cContext))
        contextString = "A bit of context about their life : " + info.cContext

    var backstoryString = ""
    if (needsGen(info.cBackstory))
        backstoryString = "Please think of a proper backstory for this character, like some big events they went through."
    else if (isUsed(info.cBackstory))
        backstoryString = "The character's backstory : " + info.cBackstory

    var expertiseString = ""
    if (needsGen(info.cExpertise))
        expertiseString = "Please think of some expertise for this character."
    else if (isUsed(info.cExpertise))
        expertiseString = "They are experts at : " + info.cExpertise

    var classString = ""
    if (needsGen(info.cClass))
        classString = "Please think of a class and/or profession for this character."
    else if (isUsed(info.cClass))
        classString = "The character's class and/or profession is " + info.cClass

    var personalityString = ""
    if (needsGen(info.cPersonality))
        personalityString = "Please think of some personality traits for this character."
    else if (isUsed(info.cPersonality))
        personalityString = "Some personality traits for this character: " + info.cPersonality

    var looksString = ""
    if (needsGen(info.cLooks))
        looksString = "Please think of what this character would physically look like."
    else if (isUsed(info.cLooks))
        looksString = "The character's looks : " + info.cLooks

    var alignment = ""
    if (needsGen(info.cAlignment))
        alignment = "Please keep in mind that the character's alignment is unknown to me but they do need one."
    else if (isUsed(info.cAlignment))
        alignment = "The character's alignment is :" + info.cAlignment + ". Please keep that in mind with all your other answers."

    let json = {
        "wInfo": wInfoString,
        "cName": nameString,
        "cAlignment": alignment,
        "cContext": contextString,
        "cBackstory":  backstoryString,
        "cExpertise": expertiseString,
        "cClass": classString,
        "cPersonality": personalityString,
        "cLooks": looksString
    }

    const prompt = `
    I need to create a character for my tabletop RPG game. Here is some info about the character put into a json object.

    ${JSON.stringify(json, null, 2)}

    "wInfo" speaks about the world the character lives in, "cName" is the name of the character, "cContext" is some context about the character's life, "cBackstory" is the character's backstory, "cExpertise" is the character's expertise, "cClass" is the character's class and/or profession, "cPersonality" is the character's personality traits and "cLooks" is what the character looks like.
    Replace the current values of the json object with the answers or info you have given me in the corresponding key and give that back as your only answer so I can parse it in my code please. no need for styling outside of the json values.
    Please make your answers as much of a story as possible, like a small paragraph, and don't forget to include the name of the character in the story. The backstory can be a bit longer.
    I do not need any info about the world, so wInfo can be left empty. I would also like the backstory to be a bit longer than the rest of the info and contain at least 3 life events. I would like to have at least some friends and family, including names, in the context part.
    `
    console.log(prompt);
    return prompt;
}