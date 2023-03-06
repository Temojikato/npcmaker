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
  const [cContext, setcContext] = useState();
  const [cBackstory, setcBackstory] = useState();
  const [cExpertise, setcExpertise] = useState();
  const [cClass, setcClass] = useState();
  const [cPersonality, setcPersonality] = useState();
  const [cLooks, setcLooks] = useState();

  const [result, setResult] = useState({result:""});
  const [submitting, setSubmitting] = useState(false);

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
    }catch(error){
      // Getting the Error details.
      const code = error.code;
      const message = error.message;
      const details = error.details;
      console.error(code + "||" + error.message + ": " + details);
      alert(message);
    };
    setSubmitting(false);
  }
  
  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Create my NPC</h3>
          <span>World context</span>
          <InputField name="worldInfo" value={wInfo} onChange={(e) => setwInfo(e.target.value)} placeholder="ex: A medieval fantasy world called WorldName where magic exists and electrical technology does not exist"/>
          <span>Name</span>
          <InputField name="characterName" value={cName} onChange={(e) => setcName(e.target.value)} placeholder="ex: Aurora, Vandrian, Ko'li'varanja"/>
          <span>Context</span>
          <InputField name="characterContext" value={cContext} onChange={(e) => setcContext(e.target.value)} placeholder="ex: lives in the royal capital with his mother and 2 younger sisters. Often hangs out with their friend Gary."/>
          <span>Backstory elements</span>
          <InputField name="characterBackstory" value={cBackstory} onChange={(e) => setcBackstory(e.target.value)} placeholder="ex: Has slain a raging bull in his youth and met a young dragon up in the mountains called Verial"/>
          <span>Expertise</span>
          <InputField name="characterExpertise" value={cExpertise} onChange={(e) => setcExpertise(e.target.value)} placeholder="ex: Lockpicking, politics, warfare, gambling"/>
          <span>Class and/or profession</span>
          <InputField name="characterClass" value={cClass} onChange={(e) => setcClass(e.target.value)} placeholder="ex: cook, wizard"/>
          <span>Personality traits</span>
          <InputField name="characterPersonality" value={cPersonality} onChange={(e) => setcPersonality(e.target.value)} placeholder="ex: Flamboyant, Tsundere, Bashful"/>
          <span>Looks</span>
          <InputField name="characterLooks" value={cLooks} onChange={(e) => setcLooks(e.target.value)} placeholder="ex: red hair, big forehead, long legs, tons of accessories"/>

          <button disabled={submitting} onClick={getNPC}>Generate npc</button>
          <div className={styles.result}>
            {result.result}
          </div>
      </main>
    </div>
  );
}

export default Home;
