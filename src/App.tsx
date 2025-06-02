import { useState,useEffect } from 'react'
import { Button,message } from 'antd'
import './App.css'

type Trigger = {
  name: string;
  description: string;
  topic: string;
  pin:number;
  value?: number;
  
};



function App() {
  const [token, setToken] = useState("");
  const [api, setApi] = useState("");  
  const [loading, setLoading] = useState(false);  
  const triggers: Trigger[] = [
    { topic: "TOMQTT_MARMAR1_COMMAND",description: "FIrst Relay On the Board" , name: "Main Power",pin:0 },
    { topic: "TOMQTT_MARMAR1_COMMAND",description: "Second Relay On the Board" , name: "Secondary 1",pin:1 },
    { topic: "TOMQTT_MARMAR1_COMMAND",description: "Third Relay On the Board" , name: "Secondary 2",pin:2 },
    { topic: "TOMQTT_MARMAR1_COMMAND",description: "Fourth Relay On the Board" , name: "Secondary 3",pin:3 }
    // Add more triggers as needed
  ];

  const startClick = (trigger: Trigger) => {
    setLoading(true);
    sendMessage(trigger,1);  
    setTimeout(()=>setLoading(false),200);
  };

  const stopClick = (trigger: Trigger) => {
    setLoading(true);
    sendMessage(trigger,0);  
    setTimeout(()=>setLoading(false),200);
  };

  const sendMessage = async (trigger: Trigger,value:number) => {
  if (!api || !token) {
    alert("API endpoint or token is missing.");
    return;
  }
  try {
    trigger.value = value;
    //alert(JSON.stringify(trigger));
    const response = await fetch(`${api}sendmessage?token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destination: trigger.topic,
        body: JSON.stringify(trigger),
        Headers:"{}"
      }),
    });
    if (!response.ok) {
      alert("Failed to send message");
    }
    //alert(`Message sent for ${trigger.name}`);
  } catch (error) {
    alert(`Error: ${(error as Error).message}`);
  }
};

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
    const apiParam = params.get("api");
    if (apiParam) {
      setApi(apiParam);
    }
  }, []);

    return (
    <>
      <h1>Site Brussels</h1>
      <h2>Demo Stuff</h2>
      <table style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Name</th>
            <th style={{ textAlign: "left" }}>Description</th>
            <th style={{ textAlign: "left" }}>Start</th>
            <th style={{ textAlign: "left" }}>Stop</th>
          </tr>
        </thead>
        <tbody>
          
          {triggers.map((trigger, idx) => (
            <tr key={idx}>
              <td style={{ textAlign: "left" }}>{trigger.name}</td>
              <td style={{ textAlign: "left" }}>{trigger.description}</td>
              <td style={{ textAlign: "left" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => startClick(trigger)}
                  disabled={loading}
                >
                  Start
                </Button>
              </td>
              <td style={{ textAlign: "left" }}>
                <Button
                  danger
                  size="large"
                  onClick={() => stopClick(trigger)}
                  disabled={loading}
                >
                  Stop
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default App
