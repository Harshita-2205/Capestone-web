"use client";

import { useState, useRef, useEffect } from "react";
import ChatInput from "../components/ChatInput";
import { socket } from "../utils/WSS";
import UserMSG from "../components/MessageDisplay";
import MessageDisplay from "../components/MessageDisplay";
import ServerMSG from "../components/ServerMSG";
import WaitingMSG from "../components/WaitingMSG";
import ChatPageSidebar from "../components/ChatPageSiderbar";
import DownloadButton from "../components/DownloadButton";
import RagChat from "../components/RagChat";
import ChatPageNavBar from "../components/ChatPageNavBar";

export default function ChatPage() {
  function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }
  const [messages, setMessages] = useState([]);

  const [photoMessages, setPhotoMessages] = useState([
    ["SERVER", "Upload Photo From Companion App To Use This Section"],
  ]);
  const [ragMessages, setRagMessages] = useState([
    [
      "SERVER",
      "Upload Files And Then Select ***Chat With PDF*** To Use This Section",
    ],
  ]);
  const [usingRag, setUsingRag] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentChatInterfaceMode, setCurrentChatInterfaceMode] =
    useState("normal");
  const [filesUploaded, setFilesUploaded] = useState(null);
  const endOfMessagesRef = useRef(null);
  const [currentStep, setCurrentStep] = useState("start");

  const tips = {
    start:
      "Describe Your Illness and It's Symtopms, Don't Forget To Mention The Gender And Age Of The Patient. \n\n \
 **More Details = Better Diagnosis**, So Share Values From Recent Reports And Tests",
    prelimRecieved: "Analyse the Prelimnary Report And Enter Your Suggestions",
    processComplete: "Thanks For Using MiniCDSS",
    reportGen: "Processing Everything And Generating",
    medicalInfoSeeked:
      "Describe Your Illness and It's Symtopms, Don't Forget To Mention The Gender And Age Of The Patient. \n\n \
 **Extracted Medical Information Will Be Used In Your Description For Better Insights**",
    takingSuggestion: "Enter Your Suggestions To Update The Prelim Report.",
  };

  socket.connect();
  useEffect(() => {
    setMessages([
      [
        "SERVER",
        "Welcome To Mini CDSS, Enter Your Illness Description To Begin Diagonasis",
      ],
    ]);
    socket.on("SERVER_MSG", (msg) => {
      setMessages((prevMessages) => [...prevMessages, ["SERVER", msg]]);
    });

    socket.on("prelimReportRes", (data) => {
      setCurrentStep("prelimRecieved");
      setMessages((prevMessages) => {
        return [
          ...prevMessages.slice(0, -1),
          ["SERVER", data[1]],
          [
            "SERVER",
            `Would you like to:  
- **Restart from scratch?** Enter \`restart\` (Reruns patient report from the start).  
- **Keep the preliminary diagnosis?** Enter \`satisfied\`.  
- **Suggest changes?** Enter \`suggest\` (Assumes you're satisfied with the initial report).  
`,
          ],
        ];
      });
      document.cookie = `activeReportID=${data[0]}; path=/; Secure; SameSite=None;`;
    });

    socket.on("prelimUpdateRes", (data) => {
      setCurrentStep("prelimRecieved");
      setMessages((prevMessages) => {
        return [
          ...prevMessages.slice(0, -1),
          ["SERVER", data],
          [
            "SERVER",
            `Would you like to:  
- **Restart from scratch?** Enter \`restart\` (Reruns patient report from the start).  
- **Keep the preliminary diagnosis?** Enter \`satisfied\`.  
- **Suggest changes?** Enter \`suggest\` (Assumes you're satisfied with the initial report).  
`,
          ],
        ];
      });
    });

    socket.on("finalReportRes", (data) => {
      setCurrentStep("processComplete");
      setMessages((prevMessages) => {
        return [
          ...prevMessages.slice(0, -1),
          ["SERVER", data],
          [
            "SERVER",
            `You Can Download The Report From Below! Thanks For Using MiniCDSS`,
          ],
        ];
      });
    });

    socket.on("imageUploadedStartWeb", (data) => {
      setCurrentChatInterfaceMode("photo");
      document.cookie = `activePhotoID=${data}; path=/; Secure; SameSite=None;`;
      setPhotoMessages([
        [
          "SERVER",
          "Data Uploaded From Companion App.\nYou Can Now Chat With CDSS To Ask Questions And Gather Information!",
        ],
      ]);
    });

    socket.on("ragMedicalInsightRes", (data) => {
      setMessages([["SERVER", data]]);
      setCurrentStep("medicalInfoSeeked");
    });

    socket.on("ragAnswer", (data) => {
      setRagMessages((prevMessages) => {
        return [...prevMessages.slice(0, -1), ["SERVER", data]];
      });
    });

    socket.on("photoQuestionRes", (data) => {
      setPhotoMessages((prevMessages) => {
        return [...prevMessages.slice(0, -1), ["SERVER", data]];
      });
    });
  }, []);

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setFilesUploaded(true);
  };

  const uploadFile = () => {
    document.getElementById("ragUpload").click();
  };

  const uploadAndInitRag = async () => {
    const formData = new FormData();

    setRagMessages([["SERVER", "Files Uploading"]]);
    var id = getCookie("activeReportID")
      ? getCookie("activeReportID")
      : (
          await (
            await fetch("http://localhost:10000/getIdForUploadingAndWorking", {
              method: "POST",
            })
          ).json()
        ).id;

    files.forEach((file) => {
      formData.append("files", file); // Append multiple files
    });

    document.cookie = `activeReportID=${id}; path=/; Secure; SameSite=None;`;
    formData.append("thread_id", id);
    try {
      var response = await fetch(
        "https://mini-cdss-fastapi.onrender.com/addFilesAndCreateVectorDB",
        {
          method: "POST",
          body: formData,
        }
      );

      setRagMessages([["SERVER", "Files Uploaded, You Can Chat With It Now"]]);
      setUsingRag(true);
      // socket.emit("ragMedicalInsightReq", id);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const extractMedicalInfo = async () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      ["SERVER", "File(s) Uploading"],
    ]);
    const formData = new FormData();

    var id = getCookie("activeReportID")
      ? getCookie("activeReportID")
      : (
          await (
            await fetch("http://localhost:10000/getIdForUploadingAndWorking", {
              method: "POST",
            })
          ).json()
        ).id;

    files.forEach((file) => {
      formData.append("files", file); // Append multiple files
    });

    document.cookie = `activeReportID=${id}; path=/; Secure; SameSite=None;`;
    formData.append("thread_id", id);
    try {
      await fetch(
        "https://mini-cdss-fastapi.onrender.com/extractMedicalDetails",
        {
          method: "POST",
          body: formData,
        }
      );

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        ["SERVER", "Files Uploaded, Now Extracting Features"],
      ]);

      socket.emit("ragMedicalInsightReq", id);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const sendRagMessage = () => {
    const inpEleVal = document.getElementById("ragChatMSG").value;
    if (!inpEleVal) {
      return;
    }

    if (usingRag) {
      setRagMessages((prevMessages) => [
        ...prevMessages,
        ["USER", inpEleVal],
        ["WAITING"],
      ]);

      socket.emit("ragQuestion", [inpEleVal, getCookie("activeReportID")]);
      return;
    }
  };

  const sendMessage = () => {
    const inpEleVal = document.getElementById("chatMSG").value;
    if (!inpEleVal) {
      return;
    }

    if (currentChatInterfaceMode == "photo") {
      if (photoMessages.length <= 3) {
        socket.emit("photoQuestionFirstReq", [
          inpEleVal,
          getCookie("activePhotoID"),
        ]);
        setPhotoMessages((prevMessages) => [
          ...prevMessages,
          ["USER", inpEleVal],
          ["WAITING"],
        ]);
        ScrollToBottom();
      } else {
        socket.emit("photoQuestionFollowingReq", [
          inpEleVal,
          getCookie("activePhotoID"),
        ]);
        setPhotoMessages((prevMessages) => [
          ...prevMessages,
          ["USER", inpEleVal],
          ["WAITING"],
        ]);
      }
      ScrollToBottom();
      return;
    }
    if (currentStep == "medicalInfoSeeked") {
      socket.emit("startRagReq", [
        inpEleVal,
        messages[0][1],
        getCookie("activeReportID"),
      ]);
      setMessages((prevMessages) => [
        ...prevMessages,
        ["USER", inpEleVal],
        ["WAITING"],
      ]);
      ScrollToBottom();
      return;
    }

    if (currentStep == "ragUploaded") {
      socket.emit("startRagReq", [
        inpEleVal,
        messages[0][1],
        getCookie("activeReportID"),
      ]);
      setMessages((prevMessages) => [
        ...prevMessages,
        ["USER", inpEleVal],
        ["WAITING"],
      ]);
      ScrollToBottom();
      return;
    }

    if (currentStep == "takingSuggestion") {
      socket.emit("updatePrelimReport", [
        inpEleVal,
        getCookie("activeReportID"),
      ]);
      setMessages((prevMessages) => [
        ...prevMessages,
        ["USER", inpEleVal],
        ["WAITING"],
      ]);
      ScrollToBottom();
      return;
    }

    if (currentStep == "prelimRecieved") {
      switch (inpEleVal.toLowerCase().trim()) {
        case "restart":
          setCurrentStep("start");
          setMessages([
            ["SERVER", "Let's Restart From Scratch! Enter Your Description"],
          ]);
          return;
          break;
        case "satisfied":
          setCurrentStep("finalReport");
          setMessages((prevMessages) => [
            ...prevMessages,
            ["USER", inpEleVal],
            ["SERVER", "Generating Final Report, Please Wait"],
          ]);
          setCurrentStep("reportGen");
          socket.emit("reportGenReq", getCookie("activeReportID"));

          ScrollToBottom();
          return;
          break;
        case "update":
          setCurrentStep("updatePrelim");
          setMessages((prevMessages) => [
            ...prevMessages,
            ["USER", inpEleVal],
            ["SERVER", "Enter Your Suggestions To Perform New Diagnosis"],
          ]);

          ScrollToBottom();
          return;
          break;
        case "suggest":
          setCurrentStep("takingSuggestion");
          setMessages((prevMessages) => [
            ...prevMessages,
            ["USER", inpEleVal],
            ["SERVER", "Enter Your Suggestions."],
          ]);

          ScrollToBottom();
          return;
          break;
        default:
          setMessages((prevMessages) => [
            ...prevMessages,
            ["USER", inpEleVal],
            ["SERVER", "Enter A Valid Option"],
          ]);

          return;
          break;
      }
    }
    socket.emit(currentStep + "Req", [inpEleVal, getCookie("activeReportID")]);
    setMessages((prevMessages) => [
      ...prevMessages,
      ["USER", inpEleVal],
      ["WAITING"],
    ]);

    ScrollToBottom();
    document.getElementById("chatMSG").value = "";
  };

  const ScrollToBottom = () => {
    document
      .getElementById("msgArea")
      .scroll(0, document.getElementById("msgArea").scrollHeight);
  }; // scroll fx

  return (
    <div className="relative h-full w-full">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('../3.jpg')] bg-cover bg-center "></div>
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-xl "></div>
      {filesUploaded == null ? (
        <>
          <div className="absolute z-50 w-screen h-screen bg-opacity-50 bg-black">
            <div className="absolute bg-blue-900 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-3xl text-center w-1/2">
              <h2 className="text-xl font-semibold ">
                Do You Have Any Medical Document?
              </h2>
              <p className="my-5 text-lg">
                You can use your medical reports to kickstart diagnosis by
                extracting medical information from it or just using it directly
                for perlimnary diagnosis
              </p>
              <div className="flex flex-row gap-10">
                <button className="bg-green-600 w-full" onClick={uploadFile}>
                  Upload Document
                </button>
                <button
                  className="bg-indigo-600 w-full"
                  onClick={() => {
                    setFilesUploaded(false);
                  }}
                >
                  {" "}
                  Continue Without Document
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      <div className="flex flex-row z-10">
        <ChatPageSidebar
          tipMSG={tips[currentStep]}
          filesUploaded={files}
          startRag={() => {
            uploadAndInitRag();
          }}
          uploadFunction={() => {
            uploadFile();
          }}
          extractMedicalFunction={() => {
            extractMedicalInfo();
          }}
        />
        <div className=" h-screen w-[52.5%] flex flex-col z-30 px-[4%]">
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            id="ragUpload"
          />

          <div
            className=" flex relative overflow-y-auto w-full flex-1 rounded-lg  py-2 gap-7 flex-col scrollable-div z-30 pt-20"
            id="msgArea"
          >
            <ChatPageNavBar
              activeInterface={currentChatInterfaceMode}
              changeInterface={setCurrentChatInterfaceMode}
            ></ChatPageNavBar>

            {currentChatInterfaceMode == "normal"
              ? messages.map((msgItem, index) => {
                  switch (msgItem[0]) {
                    case "USER":
                      return (
                        <UserMSG
                          key={index}
                          msg={msgItem[1]}
                          name={msgItem[2]}
                        ></UserMSG>
                      );

                    case "WAITING":
                      return <WaitingMSG key={index} />;

                    case "SERVER":
                      return (
                        <ServerMSG
                          isRag={false}
                          key={index}
                          msg={msgItem[1]}
                        ></ServerMSG>
                      );
                  }
                })
              : photoMessages.map((msgItem, index) => {
                  switch (msgItem[0]) {
                    case "USER":
                      return (
                        <UserMSG
                          key={index}
                          msg={msgItem[1]}
                          name={msgItem[2]}
                        ></UserMSG>
                      );

                    case "WAITING":
                      return <WaitingMSG key={index} />;

                    case "SERVER":
                      return (
                        <ServerMSG
                          isRag={false}
                          key={index}
                          msg={msgItem[1]}
                        ></ServerMSG>
                      );
                  }
                })}
          </div>
          {currentStep != "processComplete" ||
          currentChatInterfaceMode == "photo" ? (
            <ChatInput onSendMessage={sendMessage}></ChatInput>
          ) : (
            <DownloadButton id={getCookie("activeReportID")}></DownloadButton>
          )}
        </div>
        <RagChat
          messages={ragMessages}
          usingRag={usingRag}
          sendMessage={sendRagMessage}
        ></RagChat>
      </div>
    </div>
  );
}