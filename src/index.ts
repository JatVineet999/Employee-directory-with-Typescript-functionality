import './ts/sidebar'
import initializeEmployee from "./ts/employee";
import { updateSidebarSelection } from './ts/sidebar';
import initializeAddEmployee from "./ts/add-employee";
import initializeAddRoles from "./ts/add-roles";
//fetching all the html components 
const fetchComponent = async (pageName: string, componentName: string): Promise<string> => {
    try {
        const componentPath = componentName === 'sidebar' || componentName === 'header'
            ? `./html/${componentName}/index.html`
            : `./html/${pageName}/index.html`;

        const response = await fetch(componentPath);
        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${componentName} component:`, error);
        return "";
    }
};


const loadPage = (pageName: string): void => {
    const containerElement = document.getElementById("container");
    const pageStyles = document.getElementById("pageStyles") as HTMLLinkElement;
    const pageTitle = document.getElementById("pageTitle") as HTMLTitleElement;
    pageStyles.href = `./css/${pageName}.css`;
    pageTitle.innerText = `${pageName.charAt(0).toUpperCase()}${pageName.slice(1)} Dashboard`;

    Promise.all([
        fetchComponent(pageName, "sidebar"),
        fetchComponent(pageName, "header"),
        fetchComponent(pageName, "main"),
    ]).then(([sidebarHTML, headerHTML, mainHTML]) => {
        if (containerElement) {
            containerElement.innerHTML = `${sidebarHTML}${headerHTML}${mainHTML}`;
        }

        switch (pageName) {
            case 'employees':
                initializeEmployee();
                break;
            case 'add-employee':
                initializeAddEmployee();
                break;
            case 'add-roles':
                initializeAddRoles();
                break;
        }
        updateSidebarSelection(pageName);
    });
};

const handleHashChange = (): void => {
    const hash = window.location.hash.substring(1);
    const pageName = hash || "employees";
    loadPage(pageName);

};
handleHashChange();
// Listen for hash changes
window.addEventListener("hashchange", handleHashChange);
