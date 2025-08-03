import UserMSG from "./MessageDisplay";
import RagChatInput from "./RagChatInput";
import ServerMSG from "./ServerMSG";
import WaitingMSG from "./WaitingMSG";

export default function RagChat({messages,sendMessage, usingRag}) {
  console.log(messages);
  return (
    <>
      <aside className="w-[25%] z-10 h-screen  bg-opacity-55 flex justify-center  flex-col gap-5">
        <div className="h-full  bg-gray-700 bg-opacity-50 rounded-l-2xl p-4 overflow-auto flex flex-col">
          <h2 className="font-bold text-xl ">Rag Chat</h2>
          <div className="flex overflow-y-auto w-full flex-1 rounded-lg py-2 gap-7 flex-col scrollable-div z-30 pt-10">
         
          {messages.map((msgItem, index) => {
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
                  return <ServerMSG isRag={true} key={index} msg={msgItem[1]}></ServerMSG>;
              }
            })}
          </div>
          <div className="flex-shrink">
          {usingRag ?
          <RagChatInput onSendMessage={sendMessage}></RagChatInput> : <></>}
            </div>
        </div>
      </aside>
    </>
  );
}
