export default function DownloadButton({ id }) {
  return (
    <>
      <div className="p-4 backdrop-blur-0 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-3 rounded-full flex-grow">
          <button
            className="w-full p-2 rounded-full bg-indigo-700"
            onClick={async () => {
              var response = await fetch("http://localhost:10000/download-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: id,
                }),
              });
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);

              // Create a temporary link and trigger download
              const a = document.createElement("a");
              a.href = url;
              a.download = "report.pdf"; // Change filename if needed
              document.body.appendChild(a);
              a.click();

              // Cleanup
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
          >
            Download Report
          </button>
        </div>
      </div>
    </>
  );
}
