import { useState, useEffect,useCallback } from "react";
import { Button,Table } from "antd";
import "./App.css";

type Trigger = {
  name: string;
  description: string;
  topic: string;
  pin: number;
  value?: number;
};

type EnergyData = {
  [key: string]: string | number;
};

function App() {
  const [token, setToken] = useState("");
  const [api, setApi] = useState("");
  const [loading, setLoading] = useState(false);
  const [energyData, setEnergyData] = useState<EnergyData>({}); 

  const triggers: Trigger[] = [
    {
      topic: "TOMQTT_MARMAR1_COMMAND",
      description: "FIrst Relay On the Board",
      name: "Main Power",
      pin: 0,
    },
    {
      topic: "TOMQTT_MARMAR1_COMMAND",
      description: "Second Relay On the Board",
      name: "Secondary 1",
      pin: 1,
    },
    {
      topic: "TOMQTT_MARMAR1_COMMAND",
      description: "Third Relay On the Board",
      name: "Secondary 2",
      pin: 2,
    },
    {
      topic: "TOMQTT_MARMAR1_COMMAND",
      description: "Fourth Relay On the Board",
      name: "Secondary 3",
      pin: 3,
    },
    // Add more triggers as needed
  ];

    const energyColumns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

const energyDataSource = Object.entries(energyData)
  .filter(([key]) => key !== "id" && key !== "type")
  .map(([key, value]) => {
    const displayKey =
      key === "pin0" ? "Relay 1"
      : key === "pin1" ? "Relay 2"
      : key === "pin2" ? "Relay 3"
      : key === "pin3" ? "Relay 4"
      : key;

    let displayValue = value;
    if (key.startsWith("pin")) {
      if (value === 1) displayValue = "On";
      else if (value === 0) displayValue = "Off";
    } else if (typeof value === "number") {
      displayValue = value.toFixed(1);
    }

    return {
      key: displayKey,
      value: displayValue,
    };
  });

  const startClick = (trigger: Trigger) => {
    setLoading(true);
    sendMessage(trigger, 1);
    setTimeout(() => setLoading(false), 200);
  };

  const stopClick = (trigger: Trigger) => {
    setLoading(true);
    sendMessage(trigger, 0);
    setTimeout(() => setLoading(false), 200);
  };

  

  const loadData = useCallback(async () => {
    // if (!api || !token) {
    //   alert("API endpoint or token is missing.");
    //   return;
    // }
    try {
      //alert(JSON.stringify(trigger));
      const response = await fetch(
        `${api}generic/nyx_lastenergy/marmar1?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        alert("Failed to load last enery data");
      }
      const data = await response.json();
      //alert(`Last energy data: ${JSON.stringify(data.data["_source"])}`);
      setEnergyData(data.data["_source"]);
      //alert(`Message sent for ${trigger.name}`);
    } catch  {
      //alert(`Error: ${(error as Error).message}`);
    }
  }, [api, token]);

  const sendMessage = async (trigger: Trigger, value: number) => {
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: trigger.topic,
          body: JSON.stringify(trigger),
          Headers: "{}",
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
    setTimeout(() => {
      loadData()
    }, 1000);
    //loadData();
    // Call loadData every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [loadData]);

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


      <h2>Energy Data</h2>
      <Table
        loading={energyDataSource.length === 0}
        rowKey="key"
        columns={energyColumns}
        dataSource={energyDataSource}
        pagination={false}
        style={{ marginTop: 24 }}
        size="middle"
      />
    </>
  );
}

export default App;
