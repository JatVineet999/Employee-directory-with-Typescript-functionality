
function downloadCSVFile(csvFile: Blob, filename: string) {
    const url = window.URL.createObjectURL(csvFile);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.download = filename;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

export default downloadCSVFile;
