import { imageMaxSize } from "../config/index";
// Function to restrict size of image file
const checkImageSize = (e: Event): boolean => {
    const input = document.getElementById("img") as HTMLInputElement;
    const file = (e.target as HTMLInputElement).files?.[0];
    let flag = true;
    if (file && file.size > imageMaxSize) {
        alert("File size exceeds the limit of 5MB.");
        input.value = "";
        flag = false;
    }
    return flag;
};
export default checkImageSize;