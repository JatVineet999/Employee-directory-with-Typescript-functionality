class Sidebar {
    private isCollapsed: boolean = true;

    constructor() {
        // document.addEventListener('DOMContentLoaded', () => this.init());
        window.addEventListener('resize', () => this.checkWidth());
    }
    public applyCollapsedStyles(): void {
        const elements = document.querySelectorAll('.sidebarDisplayToogle');

        elements.forEach(element => {
            element.classList.toggle('collapsed', this.isCollapsed);
        });
        const logoImage = document.querySelector('.logo') as HTMLImageElement;
        const iconImages = document.querySelectorAll('.iconImages') as NodeListOf<HTMLImageElement>;
        const selectedIconImage = document.getElementById('selectedIconImage') as HTMLImageElement;
        const selectedIconImageRoles = document.getElementById('selectedIconImageR') as HTMLImageElement;

        logoImage.src = this.isCollapsed
            ? "../../src/assets/images/tezo-logo-icon.png"
            : "../../src/assets/images/tezo-logo.svg";
        iconImages.forEach(image => {
            image.style.marginLeft = this.isCollapsed ? '18%' : '0%';
        });

        selectedIconImage.style.marginLeft = this.isCollapsed ? '47%' : '0%';
        selectedIconImageRoles.style.marginLeft = this.isCollapsed ? '17%' : '0%';
    }

    public layoutChange(): void {
        this.isCollapsed = !this.isCollapsed;
        this.applyCollapsedStyles();
    }

    private checkWidth(): void {
        if (window.innerWidth < 980) {
            this.isCollapsed = true;
            this.applyCollapsedStyles();
        }
        else {
            this.isCollapsed = false;
            this.applyCollapsedStyles();
        }
    }

    private init(): void {
        this.checkWidth();
    }
}
const sidebar = new Sidebar();
(window as any).sidebar = sidebar;

//to identify selected li item//and modify style
export function updateSidebarSelection(pageName: string) {
    if (pageName === "employees" || pageName === "add-employee") {
        const selectedLiElement = document.getElementById('index')!;
        const highlightSpan = document.getElementById('indexHighlight')!;
        selectedLiElement.classList.remove('sidebarOptionInactive');
        selectedLiElement.classList.add('sidebarOptionActive');
        highlightSpan.classList.remove('none');
    }
    else {
        const selectedLiElement = document.getElementById('rolesG')!;
        const selectedIconImage = document.getElementById('selectedIconImage') as HTMLImageElement;
        const selectedIconImageRoles = document.getElementById('selectedIconImageR') as HTMLImageElement;
        const highlightSpan = document.getElementById('roleshighlight')!;
        selectedLiElement.classList.remove('sidebarOptionInactive');
        selectedLiElement.classList.add('sidebarOptionActive');
        selectedIconImage.id = 'selectedIconImageR'
        selectedIconImageRoles.id = 'selectedIconImage'
        highlightSpan.classList.remove('none');
    }
    sidebar.applyCollapsedStyles();
}

