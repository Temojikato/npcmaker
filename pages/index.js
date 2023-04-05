import Head from "next/head";

import { useState } from "react";
import styles from "./index.module.css";
import InputField from "./components/InputField";

import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable, httpsCallableFromURL } from "firebase/functions";

export async function getStaticProps() {
  return {
    props: {},
  };
}

function Home() {
  const [wInfo, setwInfo] = useState();
  const [cName, setcName] = useState();
  const [cAlignment, setcAlignment] = useState();
  const [cContext, setcContext] = useState();
  const [cBackstory, setcBackstory] = useState();
  const [cExpertise, setcExpertise] = useState();
  const [cClass, setcClass] = useState();
  const [cPersonality, setcPersonality] = useState();
  const [cLooks, setcLooks] = useState();

  const [wInfoActive, setwInfoActive] = useState(false);
  const [cNameActive, setcNameActive] = useState(false);
  const [cAlignmentActive, setcAlignmentActive] = useState(false);
  const [cContextActive, setcContextActive] = useState(false);
  const [cBackstoryActive, setcBackstoryActive] = useState(false);
  const [cExpertiseActive, setcExpertiseActive] = useState(false);
  const [cClassActive, setcClassActive] = useState(false);
  const [cPersonalityActive, setcPersonalityActive] = useState(false);
  const [cLooksActive, setcLooksActive] = useState(false);

  const [result, setResult] = useState({ result: { cName: "", cAlignment:"", cClass: "", cLooks: "", cPersonality: "", cBackstory: "", cContext: "", cExpertise: "" } });
  const [submitting, setSubmitting] = useState(false);
  const [genDone, setGenDone] = useState(false);

  const [submitting2, setSubmitting2] = useState(false);


  const firebaseConfig = {
    apiKey: process.env.FBPROJ_API_KEY,
    authDomain: process.env.FBPROJ_AUTH_DOMAIN,
    databaseURL: process.env.FBPROJ_DB_URL,
    projectId: process.env.FBPROJ_PROJECT_ID,
    storageBucket: process.env.FBPROJ_STORAGE_BUCKET,
    messagingSenderId: process.env.FBPROJ_MSG_SENDER_ID,
    appId: process.env.FBPROJ_APP_ID,
    measurementId: process.env.FBPROJ_MEASURE_ID
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const functions = getFunctions(app);

  async function getNPC() {
    setSubmitting(true);
    try {
      const result = await httpsCallableFromURL(functions, 'https://getnpc-bdwuntrh4a-uc.a.run.app')({
        wInfo: wInfo,
        cName: cName,
        cAlignment: cAlignment,
        cContext: cContext,
        cBackstory: cBackstory,
        cExpertise: cExpertise,
        cClass: cClass,
        cPersonality: cPersonality,
        cLooks: cLooks
      });
      const data = result.data;
      if (data.error != null)
        alert(data.error);
      else
        setResult(data);
        setGenDone(true);
    } catch (error) {
      // Getting the Error details.
      const code = error.code;
      const message = error.message;
      const details = error.details;
      console.error(code + "||" + error.message + ": " + details);
      alert(message);
    };
    setSubmitting(false);
  }

  const Result = () => {
    let json = JSON.stringify(result.result);
    let obj = JSON.parse(JSON.parse(json));

    console.log(obj);
    console.log(typeof obj);

    return (      
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{obj.cName}</h5>
            <h6 class="card-subtitle mb-2 text-muted">{obj.cClass}</h6>
            <p class="card-text">{obj.cLooks}</p>
            <p class="card-text">{obj.cPersonality}</p>
            <p class="card-text">{obj.cBackstory}</p>
            <p class="card-text">{obj.cContext}</p>
            <p class="card-text">{obj.cExpertise}</p>
          </div>
        </div>
    );
  }

  //q: the below radio buttons have visual bugs when clicked?
  //a:
  const Field = (name, setActive, setValue) => {
    return (
      <div class="col text-end">
        <div class="btn-group" role="group">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name={"btn" + name} id={"button-use-" + name} onClick={function (event) { setValue(""); setActive(true) }}></input>
            <label class="form-check-label" for={"btn-use-" + name}>use</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name={"btn" + name} id={"btn-gen-" + name} onClick={function (event) { setValue("generate"); setActive(false) }}></input>
            <label class="form-check-label" for={"btn-gen-" + name}>gen</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name={"btn" + name} id={"btn-no-" + name} onClick={function (event) { setValue(undefined); setActive(false) }} checked></input>
            <label class="form-check-label" for={"btn-no-" + name}>no</label>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div>
      <Head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>NPCMaker</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous" />
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Create my NPC</h3>
        <div class="container">
          <div class="row">
            <div class="name-tf mb-3 col">
              <div class="row">
                <div class="col">
                  <label for="characterNameTF" class="form-label">Name</label>
                </div>
                {Field("cName", setcNameActive, setcName)}
              </div>
              <input type="textarea" class="form-control" name="characterName" id="characterNameTF"
                value={cName} onChange={(e) => setcName(e.target.value)} disabled={!cNameActive} placeholder="ex: Aurora, Vandrian, Ko'li'varanja" />
            </div>
            <div class="alignment-tf mb-3 col">
              <div class="row">
                <div class="col">
                  <label for="characterAlignmentTF" class="form-label">Alignment</label>
                </div>
                {Field("cAlignment", setcAlignmentActive, setcAlignment)}
              </div>
              <input type="textarea" class="form-control" name="characterAlignment" id="characterAlignmentTF"
                value={cAlignment} onChange={(e) => setcAlignment(e.target.value)} disabled={!cAlignmentActive} placeholder="ex: Evil but sweet, Good but naughty, True Neutral, Lawful Evil" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="world-info-tf mb-3">
                <div class="row">
                  <div class="col">
                    <label for="WorldContextTF" class="form-label">World context</label>
                  </div>
                  {Field("wInfo", setwInfoActive, setwInfo)}
                </div>
                <textarea type="textarea" class="form-control" name="worldInfo" id="WorldContextTF" aria-describedby="WorldContextTFHelp"
                  value={wInfo} onChange={(e) => setwInfo(e.target.value)} disabled={!wInfoActive} placeholder="ex: A medieval fantasy world called WorldName where magic exists and electrical technology does not exist"
                  rows="8" style={{ fontSize: 16 + "px" }}></textarea>
                <div id="WorldContextTFHelp" class="form-text">Try to explain it in a proper story format like the example"</div>
              </div>
            </div>
            <div class="col">
              <div class="quirks-container">
                <div calss="container">
                  <div class="row expertise-tf mb-3">
                    <div class="row">
                      <div class="col">
                        <label for="characterExpertiseTF" class="form-label">Expertise</label>
                      </div>
                      {Field("cExpertise", setcExpertiseActive, setcExpertise)}
                    </div>
                    <div class="col">
                      <input type="textarea" class="form-control" name="characterExpertise" id="characterExpertiseTF"
                        value={cExpertise} onChange={(e) => setcExpertise(e.target.value)} disabled={!cExpertiseActive} placeholder="ex: Lockpicking, politics, warfare, gambling" />
                    </div>
                  </div>
                  <div class="row class-tf mb-3">
                    <div class="row">
                      <div class="col">
                        <label for="characterClassTF" class="form-label">Class and/or profession</label>
                      </div>
                      {Field("cClass", setcClassActive, setcClass)}
                    </div>
                    <div class="col">
                      <input type="textarea" class="form-control" name="characterClass" id="characterClassTF"
                        value={cClass} onChange={(e) => setcClass(e.target.value)} disabled={!cClassActive} placeholder="ex: cook, wizard" />
                    </div>
                  </div>
                  <div class="row personality-tf mb-3">
                    <div class="row">
                      <div class="col">
                        <label for="characterPersonalityTF" class="form-label">Personality traits</label>
                      </div>
                      {Field("cPersonality", setcPersonalityActive, setcPersonality)}
                    </div>
                    <div class="col">
                      <input type="textarea" class="form-control" name="characterPersonality" id="characterPersonalityTF" aria-describedby="characterPersonalityTFHelp"
                        value={cPersonality} onChange={(e) => setcPersonality(e.target.value)} disabled={!cPersonalityActive} placeholder="ex: Flamboyant, Tsundere, Bashful" />
                    </div>
                    <div id="characterPersonalityTFHelp" class="form-text">Try to stick to singular words or small sentences like "always skipping about"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="backstory-tf mb-3">
                <div class="row">
                  <div class="col">
                    <label for="characterBackstoryTF" class="form-label">Backstory elements</label>
                  </div>
                  {Field("cBackstory", setcBackstoryActive, setcBackstory)}
                </div>
                <textarea type="textarea" class="form-control" name="characterBackstory" id="characterBackstoryTF" aria-describedby="characterBackstoryTFHelp"
                  value={cBackstory} onChange={(e) => setcBackstory(e.target.value)} disabled={!cBackstoryActive} placeholder="ex: Has slain a raging bull in his youth and met a young dragon up in the mountains called Verial"
                  rows="5" style={{ fontSize: 16 + "px" }}></textarea>
                <div id="characterBackstoryTFHelp" class="form-text">Try to stick to a nice short summarisation"</div>
              </div>
            </div>
            <div class="col">
              <div class="context-tf mb-3">
                <div class="row">
                  <div class="col">
                    <label for="characterContextTF" class="form-label">Context</label>
                  </div>
                  {Field("cContext", setcContextActive, setcContext)}
                </div>
                <textarea type="textarea" class="form-control" name="characterContext" id="characterContextTF" aria-describedby="characterContextTFHelp"
                  value={cContext} onChange={(e) => setcContext(e.target.value)} disabled={!cContextActive} placeholder="ex: lives in the royal capital with his mother and 2 younger sisters. Often hangs out with their friend Gary."
                  rows="5" style={{ fontSize: 16 + "px" }}></textarea>
                <div id="characterContextTFHelp" class="form-text">Anything external that is important to this character's story</div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="looks-tf mb-3">
              <div class="row">
                <div class="col">
                  <label for="characterLooksTF" class="form-label">Looks</label>
                </div>
                {Field("cLooks", setcLooksActive, setcLooks)}
              </div>
              <input type="textarea" class="form-control" name="characterLooks" id="characterLooksTF" aria-describedby="characterLooksTFHelp"
                value={cLooks} onChange={(e) => setcLooks(e.target.value)} disabled={!cLooksActive} placeholder="ex: a woman with long red hair wearing an office suit, sunglasses and a ton of accessories" />
              <div id="characterLooksTFHelp" class="form-text">Try to describe it within a single sentence</div>
            </div>
          </div>
        </div>

        <div class="d-grid gap-2 col-6 mx-auto">
          <button disabled={submitting} onClick={getNPC} class="btn btn-primary" type="button">Generate npc</button>
        </div>
        <div>
          { genDone && <Result /> }
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous" />
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3" crossorigin="anonymous" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js" integrity="sha384-mQ93GR66B00ZXjt0YO5KlohRA5SY2XofN4zfuZxLkoj1gXtW8ANNCe9d5Y3eG5eD" crossorigin="anonymous" />
      </main>
    </div>
  );
}

export default Home;
