function UserMSG({ msg, name = "User", sending = false }) {
  return (
    <>
      <div className="w-fit max-w-[90%] h-fit rounded-2xl flex flex-col text-white text-center bg-opacity-35 gap-2 mr-0 ml-auto">
        <div
          className={`flex flex-row-reverse text-sm font-bold  flex-1 items-center gap-2`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-4"
          >
            <path
              fill-rule="evenodd"
              d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
              clip-rule="evenodd"
            />
          </svg>
          {name}
        </div>
        <div className="bg-white bg-opacity-10 text-left flex-1 text-base px-3 py-2 rounded-lg">
          {msg}
        </div>
      </div>
    </>
  );
}

export default UserMSG;
