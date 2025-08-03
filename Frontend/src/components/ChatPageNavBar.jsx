export default function ChatPageNavBar({
  activeInterface,
  changeInterface,
}) {
  return (
    <>
      <nav className=" w-[50%] flex left-[49%] right0 gap-2 top-2 bg-opacity-50 z-50 rounded-full -translate-x-1/2 fixed">
        <button className={`flex-1 bg-gray-500 ${activeInterface === "normal" ? "!bg-blue-500" : ""}`}

          onClick={() => changeInterface("normal")}
        >
          Chat Model
        </button>
        <button
          className={`flex-1 bg-gray-500 ${activeInterface === "photo" ? "!bg-blue-500" : ""}`}

          onClick={() => changeInterface("photo")}
        >
          Vision Model
        </button>
      </nav>
    </>
  );
}
