import { useState, useEffect,useCallback } from "react";
import { Button,Table,Progress } from "antd";
import { green, red,orange } from '@ant-design/colors';
import { CheckCircleTwoTone,CloseCircleTwoTone } from '@ant-design/icons';
import "./App.css";
import { getLanguage, translate, type Lang } from "./i18n";

type Trigger = {
  name: string;
  description: string;
  topic: string;
  pin: number;
  value?: number;
};

type Config={
  title: string|null;
  subtitle: string|null 
  triggers:Trigger[] 
}

type EnergyData = {
  [key: string]: string | number;
};

type Di={
  key:string,
  value:number
}

type Relay={
  key:string,
  value:number
}

function App() {
  const [received, setReceived] = useState<number>(0);
  const [sent, setSent] = useState<number>(0);
  const [dis, setDis] = useState<Di[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [token, setToken] = useState("");
  const [api, setApi] = useState("");
  const [siteId, setSiteId] = useState("marmar1");
  const [loading, setLoading] = useState(false);
  const [energyData, setEnergyData] = useState<EnergyData>({});
  const [timestamp, setTimestamp] = useState<Date | null>(null); 
  const [timeDifference,setTimeDifference] = useState<string>("");
  const [alive, setAlive] = useState<boolean>(false);
  const [config, setConfig] = useState<Config>({
    title: "",
    subtitle: "",
    triggers: []
  });

  const [language] = useState<Lang>(() => getLanguage());
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(language, key, params);
  const onLabel = t("on");
  const offLabel = t("off");

  

    const energyColumns = [
    {
      title: t("key"),
      dataIndex: "key",
      key: "key",
    },
    {
      title: t("value"),
      dataIndex: "value",
      key: "value",
    },
  ];

const getTimeDifference = (timestamp: Date | null): string => {
    setAlive(false);
    if (!timestamp) return t("no_data");
    
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      setAlive(true);
      return t(diffSeconds === 1 ? "seconds_ago_one" : "seconds_ago_other", { n: diffSeconds });
    } else if (diffMinutes < 60) {
      if (diffMinutes < 6) setAlive(true);
      return t(diffMinutes === 1 ? "minutes_ago_one" : "minutes_ago_other", { n: diffMinutes });
    } else if (diffHours < 24) {
      return t(diffHours === 1 ? "hours_ago_one" : "hours_ago_other", { n: diffHours });
    } else {
      return t(diffDays === 1 ? "days_ago_one" : "days_ago_other", { n: diffDays });
    }
  };

const energyDataSource = Object.entries(energyData)
  .filter(([key]) => key !== "id" && key !== "type" && key.indexOf('pin') !== 0 && key.indexOf('di') !== 0  && key.indexOf('rx') !== 0  && key.indexOf('tx') !== 0  && key.indexOf('temperature') !== 0)
  .map(([key, value]) => {
    const displayKey =
      key === "pin0" ? t("relay", { n: 1 })
      : key === "pin1" ? t("relay", { n: 2 })
      : key === "pin2" ? t("relay", { n: 3 })
      : key === "pin3" ? t("relay", { n: 4 })
      : key === "pin4" ? t("relay", { n: 5 })
      : key === "pin5" ? t("relay", { n: 6 })
      : key === "pin6" ? t("relay", { n: 7 })
      : key === "pin7" ? t("relay", { n: 8 })
      : key;

    let displayValue = value;
    if (key.startsWith("pin")|| key.startsWith("di") ) {
      if (value === 1) displayValue = onLabel;
      else if (value === 0) displayValue = offLabel;
    } else if (typeof value === "number") {
      displayValue = value.toFixed(1);
    }
    else if (typeof value === "object") {
      displayValue = JSON.stringify(value, null, 2);
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
        `${api}generic/nyx_lastenergy/${siteId}?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        //alert("Failed to load last enery data");
        return;
      }
      const data = await response.json();
      // Store the @timestamp field as a Date object
      if (data.data["_source"]["@timestamp"]) {
        setTimestamp(new Date(data.data["_source"]["@timestamp"]));    
        
        setTimeDifference(getTimeDifference(timestamp));    
      }

      if (data.data["_source"]["rx"]) {
        setReceived(data.data["_source"]["rx"]);    
      }
      if (data.data["_source"]["tx"]) {
        setSent(data.data["_source"]["tx"]);    
      }

      //alert(`Last energy data: ${JSON.stringify(data.data["_source"])}`);
      const newdis=[]
      for(let i=0;i<8;i++)
      {
        const key=`di${i}`;
        if(data.data["_source"][key]!==undefined)
        {
          newdis.push({"key": t("input", { n: i + 1 }), "value":data.data["_source"][key]});
        }
      }
      setDis(newdis);

      const newrelays=[]
      for(let i=0;i<8;i++)
      {
        const key=`pin${i}`;
        if(data.data["_source"][key]!==undefined)
        {
          newrelays.push({"key": t("relay", { n: i + 1 }), "value":data.data["_source"][key]});
        }
      }
      setRelays(newrelays);


      setEnergyData(data.data["_source"]);
      //alert(`Message sent for ${trigger.name}`);
    } catch  {
      //alert(`Error: ${(error as Error).message}`);
    }
    try {
      //alert(JSON.stringify(trigger));
      const response = await fetch(
        `${api}generic/nyx_marmar_config/${siteId}?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        //alert("Failed to load last enery data");
        return;
      }
      const data = await response.json();
      //alert(`Last energy data: ${JSON.stringify(data.data["_source"])}`);
      setConfig(data.data["_source"]);
      //alert(`Message sent for ${trigger.name}`);
    } catch  {
      //alert(`Error: ${(error as Error).message}`);
    }
  }, [api, token,siteId, timestamp]);

  const sendMessage = async (trigger: Trigger, value: number) => {
    if (!api || !token) {
      alert(t("api_token_missing"));
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
        alert(t("failed_send"));
      }
      //alert(`Message sent for ${trigger.name}`);
    } catch (error) {
      alert(t("error", { message: (error as Error).message }));
    }
  };

// Create columns for Digital Inputs table
const disColumns = dis.map((di) => ({
  title: di.key,
  dataIndex: di.key,
  key: di.key,
  align: 'center' as const,
  render: (value: string) => (
    <span
      style={{
        backgroundColor: value === onLabel ? "#52c41a" : "#ff4d4f",
        color: "white",
        padding: "4px 8px",
        borderRadius: "4px",
        fontWeight: "bold"
      }}
    >
      {value}
    </span>
  ),
}));
  // Create data source for Digital Inputs table
  const disDataSource = [{
    key: 'values',
    ...dis.reduce((acc, di) => {
      acc[di.key] = di.value === 1 ? onLabel : offLabel;
      return acc;
    }, {} as Record<string, string>)
  }];

// Create columns for Digital Inputs table
const relayColumns = relays.map((di) => ({
  title: di.key,
  dataIndex: di.key,
  key: di.key,
  align: 'center' as const,
  render: (value: string) => (
    <span
      style={{
        backgroundColor: value === onLabel ? "#52c41a" : "#ff4d4f",
        color: "white",
        padding: "4px 8px",
        borderRadius: "4px",
        fontWeight: "bold"
      }}
    >
      {value}
    </span>
  ),
}));
  // Create data source for Digital Inputs table
  const relaysDataSource = [{
    key: 'values',
    ...relays.reduce((acc, di) => {
      acc[di.key] = di.value === 1 ? onLabel : offLabel;
      return acc;
    }, {} as Record<string, string>)
  }];

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
    const siteId = params.get("siteid");
    if (siteId) {
      setSiteId(siteId);
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
      <h1>{config.title || t("loading")}</h1>
      <h2>{config.subtitle}</h2>
      {config.triggers.length > 0 && (
      <table style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>{t("name")}</th>
            <th style={{ textAlign: "left" }}>{t("description")}</th>
            <th style={{ textAlign: "left" }}>{t("start")}</th>
            <th style={{ textAlign: "left" }}>{t("stop")}</th>
          </tr>
        </thead>
        <tbody>
          {config.triggers.map((trigger, idx) => (
            <tr key={idx}>
              <td style={{ textAlign: "left" }}>{trigger.name}</td>
              <td style={{ textAlign: "left" }}>{trigger.description}</td>
              <td style={{ textAlign: "left" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => startClick(trigger)}
                  disabled={loading || !alive}
                >
                  {t("start")}
                </Button>
              </td>
              <td style={{ textAlign: "left" }}>
                <Button
                  danger
                  size="large"
                  onClick={() => stopClick(trigger)}
                  disabled={loading || !alive}
                >
                  {t("stop")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>)}


      { relays.length > 0 && (
        <>
      <h2>{t("relays")}</h2>
      <Table
        columns={relayColumns}
        dataSource={relaysDataSource}
        pagination={false}
        showHeader={true}
        size="middle"
        style={{ marginTop: 16 }}
      /></>)}

      { dis.length > 0 && (
        <>
      <h2>{t("digital_inputs")}</h2>
      <Table
        columns={disColumns}
        dataSource={disDataSource}
        pagination={false}
        showHeader={true}
        size="middle"
        style={{ marginTop: 16 }}
      /></>)}

      <h2>{t("module_status")}</h2>
      <table width={"100%"} style={{ textAlign: "center", marginTop: 16 }}>
        <tr>
          <td style={{ textAlign: "center",width:"33%" }}>{t("alive")}</td>
          <td style={{ textAlign: "center" }}>{t("messages_sent")}</td> 
          <td style={{ textAlign: "center" }}>{t("messages_received")}</td>          
        </tr>
        <tr>
          <td style={{ textAlign: "center" }}>
            <>
            {alive && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleTwoTone title={timestamp?.toLocaleString()} twoToneColor="#52c41a" style={{fontSize:30}} />
              <span style={{ fontSize: "0.7em", color: "#888" }}>
                {timeDifference}</span>
            </div>}
            {!alive && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <CloseCircleTwoTone title={timestamp?.toLocaleString()} twoToneColor="#ff4d4f" style={{fontSize:30}} />
              <span style={{ fontSize: "0.7em", color: "#888" }}>
                {timeDifference}</span>
              </div>}
            </>
          </td>
          <td style={{ textAlign: "center",fontSize: "1.2em",fontWeight:"bolder" }}>{sent}</td> 
          <td style={{ textAlign: "center",fontSize: "1.2em",fontWeight:"bolder"  }}>{received}</td>          
        </tr>        
        <tr>
          <td style={{ textAlign: "center" }}>{t("disk_fill")}</td> 
          <td style={{ textAlign: "center" }}>{t("load")}</td>          
          <td style={{ textAlign: "center" }}>{t("temperature")}</td>                    
        </tr>
        <tr>
          <td style={{ textAlign: "center" }}><Progress  percent={parseFloat(''+energyData.diskfill)} steps={10} strokeColor={[green[6],green[6], orange[6], red[5]]} /></td> 
          <td style={{ textAlign: "center" }}><Progress  percent={parseFloat((parseFloat(''+energyData.load)*100/4).toFixed(0))} steps={10} strokeColor={[green[6],green[6], orange[6], red[5]]} /></td>          
          <td style={{ textAlign: "center" }}><Progress  format={(percent) => `${percent} °`} percent={parseFloat(''+energyData.temperature)} steps={10} strokeColor={[green[6],green[6], green[6], green[6], green[6], green[6], red[5]]} /></td>          
        </tr>
      </table>

      <h2>{t("energy_data")}</h2>
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
