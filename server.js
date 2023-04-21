const openAI = require("openai");
const fetch = require("node-fetch");

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
            const systemMessage = {
                role: "system",
                content: "You will be generating TTRPG npc's for me. I will give it to you in a template json object and then just some requirements in a chat format after. Please fill in the values and give it back to me. In the prompt there will be further requirements for every field of the JSON and its value. You will have to remove any styling and just return your answer like the template JSON.",
            }
            const rqBody = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    systemMessage,
                    generatePromptNPC(request.data)
                ],
            }
            //create a proper JSON payload for the OpenAI API with system message and prompt for the body of the request
            functions.logger.log("REQUEST BODY");
            const json = JSON.stringify(rqBody);
            functions.logger.log(json);
            //fetch a POST from https://api.openai.com/v1/chat/completions with bearer token and rqbody as a json body then return the response as the resolved promise

            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: json,
            }).then(async (res) => {
                const data = await res.json();
                functions.logger.log("DATA HERE");
                functions.logger.log(data);
                return (resolve({ data: data }));
            });
        } catch (error) {
            functions.logger.log(error);
            // Consider adjusting the error handling logic for your use case
            if (error.response) {
                console.error(error.response.status, error.response.data);
                return (reject(error.response.data))
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                return (reject(error))
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
        wInfoString += (": " + info.wInfo);
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
        contextString = info.cContext

    var backstoryString = ""
    if (needsGen(info.cBackstory))
        backstoryString = "Please think of a proper backstory for this character, like some big events they went through."
    else if (isUsed(info.cBackstory))
        backstoryString = info.cBackstory

    var expertiseString = ""
    if (needsGen(info.cExpertise))
        expertiseString = "Please think of some expertises for this character, at least 3. Prefarably in different fields."
    else if (isUsed(info.cExpertise))
        expertiseString = info.cExpertise

    var classString = ""
    if (needsGen(info.cClass))
        classString = "Please think of a class and/or profession for this character per standard tabletop fantasy rules."
    else if (isUsed(info.cClass))
        classString = info.cClass

    var personalityString = ""
    if (needsGen(info.cPersonality))
        personalityString = "Please think of some personality traits for this character. Some good, some bad."
    else if (isUsed(info.cPersonality))
        personalityString = info.cPersonality

    var looksString = ""
    if (needsGen(info.cLooks))
        looksString = "Please think of what this character would physically look like. Height, build, hair color, eye color, etc."
    else if (isUsed(info.cLooks))
        looksString = info.cLooks

    var alignment = ""
    if (needsGen(info.cAlignment))
        alignment = "Please keep in mind that the character's alignment is unknown to me but they do need one."
    else if (isUsed(info.cAlignment))
        alignment = info.cAlignment

    let json = {
        "wInfo": wInfoString,
        "cName": nameString,
        "cAlignment": alignment,
        "cContext": contextString,
        "cBackstory": backstoryString,
        "cExpertise": expertiseString,
        "cClass": classString,
        "cPersonality": personalityString,
        "cLooks": looksString
    }

    const prompt = `
    I need to create a character for my tabletop RPG game. Here is some info about the character put into a json object.

    ${JSON.stringify(json, null, 2)}

    "wInfo" speaks about the world the character lives in, "cName" is the name of the character, "cContext" is some context about the character's life, "cBackstory" is the character's backstory, "cExpertise" is the character's expertise, "cClass" is the character's class and/or profession, "cPersonality" is the character's personality traits and "cLooks" is what the character looks like. cAlignment is the character's alignment and should be taken into account with ALL answers.
    Replace the current values of the json object with the answers or info you have given me in the corresponding key and give that back as your only answer so I can parse it in my code please. no need for styling outside of the json values.

    Here is a couple of important points for the values to return:
    all: Please make your answers as much of a story as possible, like a small paragraph or two, and don't forget to include the name of the character in the story. try to add some extra info and flavor to any information I have already given you. 
    cName: Please keep gender and race in mind when thinking of names. If these are not known yet, you can do whatever you want. Make sure to create full names, first name and last name. Mayben even a middle name every now and then, flip a coin. The answer you give should be just the name as I will use it as a title.
    cClass: This is the subtitle of the character, so make sure to include the class and/or profession of the character. If the character has multiple classes, please make sure to include all of them. If the character has no class or profession, please make sure to include that as well. No unnecessary text please as it is a subtitle.
    cBackstory: The backstory must be a bit longer, more expansive and detailed. I need at least 3 life changing events for the character to have gone through.
    cLooks: Please make sure to keep in mind future ai image generation on cLooks, make it like an image generation prompt so I can immediately send it through an image generation API. I need at least 150 token's worth and some high quality rendering tags.
    wInfo: I do not need any info about the world, so wInfo can be left empty. 
    cContext: I would like to have at least some friends and family, including names and profession, in the context part. 
    cExpertise: make sure to transform the info into a nice story, including where they learned these for example.
    cAlignment: should be just the alignment, like "Chaotic Good" or "Neutral Evil".

    Make sure not to put a trailing comma at the end of the last key value pair in the json object you return. It will break my code. so no comma after the value of cPersonality.
    Most importantly make sure not to repeat any information across the different keys and values. Fill them up with new ideas and information. Do not recycle any asnwers from other keys.
    Make sure to not put any control characters in your answers, like newlines, tabs, etc. I will be parsing the answers with a regex and it will break if you do that. \n is fine though.
    `
    console.log(prompt);

    const promptMessage = {
        role: "user",
        content: prompt,
    }
    return promptMessage;
}



exports.getimage = onCall((req) => {
    const Configuration = openAI.Configuration;
    const OpenAIApi = openAI.OpenAIApi;
    functions.logger.log(req);
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
            const prompt = req.data.prompt;
            const promptFull = "a character from a dnd fantasy world: " + prompt;
            const completion = await openai.createImage({
                prompt: promptFull,
                n: 1,
                size: "512x512",
            })
            return (resolve({ result: completion.data.data[0].url }));
        } catch (error) {
            if (error.response) {
                console.error(error.response.status, error.response.data);
                return reject(error)
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                return reject(error)
            }
        }
    });
});