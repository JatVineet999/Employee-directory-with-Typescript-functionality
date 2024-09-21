import LocalStorageService from './utils/localStorageService';
import { IEmployee, ISelectedFilter } from "./types/index";
import downloadCSVFile from "./utils/downloadCsvFile";

const initializeEmployee = (): void => {
    // initial call to generate alphabetical filters options
    displayAlphabetFilter();
    // initial call to reset all filters upon page load
    const filteredEmployees = employeeDashboard.filterEmployees();
    employeeDashboard.updateEmployeesTable(filteredEmployees);
    // export-function call
    const exportButton = document.getElementById('btnExport');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            employeeDashboard.exportEmployeesData();
        });
    }
};



const displayAlphabetFilter = (): void => {
    const filterDiv = document.getElementById("alphabeticalFilter");
    if (filterDiv) {
        for (let i = 1; i <= 26; i++) {
            const charCode = String.fromCharCode(64 + i);
            filterDiv.insertAdjacentHTML(
                "beforeend",
                `
                <li onclick="employeeDashboard.alphabeticalFilter('${charCode}')" class="filterAlphabets" id="${charCode}">${charCode}</li>
                `
            );
        }
    }
};

class EmployeeDashboard {

    private selectedFilter: ISelectedFilter = {
        char: "",
        status: "",
        location: "",
        department: "",
    };
    private activeAlphabet = "";
    private sortAscending = true;
    //function to export Data
    exportEmployeesData() {
        const EmployeeArray = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');
        if (EmployeeArray.length === 0) return;
        const headers = Object.keys(EmployeeArray[0]).filter(
            (header) => header !== "img" && header !== "isChecked"
        );
        const csvContent = EmployeeArray
            .map((employee) =>
                headers.map((header) => `"${employee[header]}"`).join(",")
            )
            .join("\n");
        const CSVFile = new Blob([headers.join(",") + "\n" + csvContent], {
            type: "csv",
        });
        downloadCSVFile(CSVFile, 'EmployeeTable.csv');

    }

    displayEllipsisOptions(menuId: string, event: Event): void {
        const menu = document.getElementById(menuId);

        if (!menu) return;

        menu.style.display = menu.style.display === "block" ? "none" : "block";

        const triggerButton = event.target as HTMLElement;

        const closeMenu = (event: MouseEvent): void => {
            if (event.target !== triggerButton && !menu!.contains(event.target as Node)) {
                menu!.style.display = "none";
                document.removeEventListener("click", closeMenu);
            }
        };

        document.addEventListener("click", closeMenu);
    }

    redirectToEditEmployee(employeeId: string, check: boolean): void {
        window.location.href = `./index.html?empNo=${employeeId}&viewMode=${check}#add-employee`;
    }

    updateEmployeesTableCheckbox(empNo: string, check: boolean, selectAll: boolean): void {
        let data = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');
        let flag: boolean = false;

        data = data.map((employee) => {
            if (selectAll || employee.empNo === empNo) {
                employee.isChecked = check;
            }
            if (employee.isChecked) {
                flag = true;
            }
            return employee;
        });

        LocalStorageService.setData<IEmployee[]>(data, 'EmployeeRecords');
        this.updateEmployeesTable(data);
        this.deleteButton(flag);
    }

    deleteButton(isDisabled: boolean): void {
        const btnDelete = document.getElementById("btnDelete");
        if (btnDelete) {
            btnDelete.style.backgroundColor = isDisabled ? "red" : "#F89191";
        }
    }

    deleteEmployee(empNo = null): void {
        let EmployeeArray = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');

        if (empNo) {
            EmployeeArray = EmployeeArray.filter((employee) => employee.empNo !== empNo);
        } else {
            EmployeeArray = EmployeeArray.filter((employee) => employee.isChecked !== true);
        }

        LocalStorageService.setData<IEmployee[]>(EmployeeArray, 'EmployeeRecords');
        this.updateEmployeesTable(EmployeeArray);
        this.deleteButton(false);
        const employeeCheckbox = document.getElementById("employeeSelect") as HTMLInputElement;

        if (employeeCheckbox && employeeCheckbox.checked) {
            employeeCheckbox.checked = !employeeCheckbox.checked;
        }

        this.updateEmployeesTable(EmployeeArray);
    }

    employeeRow(data: IEmployee): void {
        const tableBody = document.getElementById("employeeTableBody");

        const tr = document.createElement("tr");
        tr.classList.add("employee-table-row");

        tr.innerHTML = `
            <td class="selected-employee">
                <input type="checkbox" ${data.isChecked ? "checked" : ""
            } name="select" class="select" id="${data.empNo
            }" onchange="employeeDashboard.updateEmployeesTableCheckbox('${data.empNo}',this.checked),false">
            </td>
            <td class="d-flex jus-content-start emp-profile">
                <div class="emp-profile-container">
                    <img src="${data.img || "/images/profile-pic.png"
            }" alt="employee-image" class="employee-img">
                </div>
                <div class="employee-profile d-flex flex-col">
                    <span class="employee-name">${data.fname} ${data.lname}</span>
                    <span class="employee-email">${data.email}</span>
                </div>
            </td>
            <td class="employee-location">${data.location}</td>
            <td class="employee-department">${data.dept}</td>
            <td class="employee-role">${data.role}</td>
            <td class="employee-no">${data.empNo}</td>
            <td class="employee-status">
                <span class="employee-status-value">${data.status || "Active"
            }</span>
            </td>
            <td class="employee-join-dt">${data.joinDate}</td>
        <td class="row-edit-container">
                <button class="three-dots" onclick="employeeDashboard.displayEllipsisOptions('${data.empNo}x',event)">
                    <img src="${data.dots || './assets/images/load-more.png'}" alt="three-dot">
                </button>
                <div class="menu" id="${data.empNo}x">
                <ul><li onclick="employeeDashboard.redirectToEditEmployee('${data.empNo}',false);">
    Edit</li><li onclick="employeeDashboard.redirectToEditEmployee('${data.empNo}',true)">View</li><li id="${data.empNo}"  onclick="employeeDashboard.deleteEmployee('${data.empNo}')">Delete</li>
                </ul>
                </div>
            </td>
        `;

        if (tableBody) {
            tableBody.appendChild(tr);
        }
    }

    updateEmployeesTable(employeesData: IEmployee[]): void {
        const tableBody = document.getElementById("employeeTableBody");

        if (tableBody) {
            tableBody.innerHTML = "";
            employeesData.forEach((employee) => {
                this.employeeRow(employee);
            });

            const noDataRow = document.getElementById("noDataRow");

            if (employeesData.length === 0 && !noDataRow) {
                const noDataRowHTML = `
                <div class="no-data-row" id="noDataRow">
                    <p>No Data To Show</p>
                </div>`;

                const employeeDetailsContainer = document.getElementById("employeeDetailsContainer");

                if (employeeDetailsContainer) {
                    employeeDetailsContainer.insertAdjacentHTML("beforeend", noDataRowHTML);
                } else {
                    console.error("Element with id 'employeeDetailsContainer' not found");
                }
            } else if (employeesData.length > 0 && noDataRow) {
                noDataRow.parentNode!.removeChild(noDataRow);
            }
        } else {
            console.error("Element with id 'employeeTableBody' not found");
        }
    }
    clearAlphabetFilter() {
        if (this.activeAlphabet) {
            const disableAlphabet = document.getElementById(this.activeAlphabet);
            disableAlphabet?.classList.remove("isActive");
        }
    }

    resetAlphabeticalFilter(): void {
        this.clearAlphabetFilter();
        this.selectedFilter.char = "";
        let filteredEmployees = this.filterEmployees();
        this.updateEmployeesTable(filteredEmployees);
    }

    alphabeticalFilter(letter: string): void {
        this.clearAlphabetFilter();
        let alphabet = document.getElementById(letter)!;

        if (this.selectedFilter.char.indexOf(letter) === -1) {
            this.selectedFilter.char = letter;
            let filteredEmployees = this.filterEmployees();
            this.updateEmployeesTable(filteredEmployees);
            alphabet.classList.add("isActive");
            this.activeAlphabet = letter;
        } else {
            this.selectedFilter.char = "";
            let filteredEmployees = this.filterEmployees();
            this.updateEmployeesTable(filteredEmployees);
            alphabet.classList.remove("isActive");
        }
    }

    resetDropDownFilters(): void {
        const dropdownIds = [
            "statusDropdown",
            "locationDropdown",
            "departmentDropdown",
        ];

        const filtersToReset = ["Status", "Location", "Department"];

        dropdownIds.forEach((id, index) => {
            const dropdown = document.getElementById(id) as HTMLInputElement;
            dropdown.value = filtersToReset[index];
        });

        this.selectedFilter.status = "";
        this.selectedFilter.location = "";
        this.selectedFilter.department = "";

        this.displayFilterButtons();
        let filteredEmployees = this.filterEmployees();
        this.updateEmployeesTable(filteredEmployees);
    }

    displayFilterButtons(): void {
        const filterButtons = document.getElementById("filterButtons")!;
        const locationDropdownValue = this.selectedFilter.location;
        const statusDropdownValue = this.selectedFilter.status;
        const departmentDropdownValue = this.selectedFilter.department;

        if (
            locationDropdownValue[0] !== "Location" ||
            statusDropdownValue[0] !== "Status" ||
            departmentDropdownValue[0] !== "Department"
        ) {
            filterButtons.style.display = "flex";
        } else {
            filterButtons.style.display = "none";
        }
    }

    applyDropdownFilters(): void {
        this.setFilterValue("department", "departmentDropdown");
        this.setFilterValue("location", "locationDropdown");
        this.setFilterValue("status", "statusDropdown");

        let filteredEmployees = this.filterEmployees();
        this.updateEmployeesTable(filteredEmployees);
    }

    setFilterValue(filterKey: string, dropdownId: string): void {
        const selectedValue = (document.getElementById(dropdownId) as HTMLSelectElement).value;

        // Use type assertion to ensure that filterKey is a valid key for SelectedFilter
        (this.selectedFilter as any)[filterKey] =
            selectedValue !== "Department" &&
                selectedValue !== "Location" &&
                selectedValue !== "Status"
                ? selectedValue
                : "";
    }

    filterEmployees(): IEmployee[] {
        const EmployeeArray = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');
        const { char, status, location, department } = this.selectedFilter;

        const filterdEmployeesData = EmployeeArray.filter((data) => {
            const fnameInitial = data.fname.charAt(0).toUpperCase();
            const matchesChar =
                char.length === 0 || fnameInitial === char.toUpperCase();
            const matchesStatus = status.length === 0 || status === data.status;
            const matchesLocation =
                location.length === 0 || location === data.location;
            const matchesDepartment =
                department.length === 0 || department === data.dept;
            return matchesChar && matchesStatus && matchesLocation && matchesDepartment;
        });

        return filterdEmployeesData;
    }

    sortTableDataByKey(key: string): void {
        let employeesData = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');

        employeesData.sort((a, b) => {
            const valueA = this.getValueForKey(a, key);
            const valueB = this.getValueForKey(b, key);

            if (this.sortAscending) {
                return this.compareValues(valueA, valueB);
            } else {
                return this.compareValues(valueB, valueA);
            }
        });

        this.updateEmployeesTable(employeesData);
        this.sortAscending = !this.sortAscending;
    }

    getValueForKey(obj: IEmployee, key: string): string | number {
        switch (key) {
            case "empName":
                return obj["fname"] + " " + obj["lname"];
            case "location":
            case "dept":
            case "role":
            case "joinDate":
                return obj[key];
            case "empNo":
                return obj[key] ? parseInt(obj[key].match(/\d+/)?.[0] || '0') : 0;
            default:
                return "";
        }
    }

    compareValues(valueA: string | number, valueB: string | number): number {
        if (valueA === "" && valueB === "") {
            return 0;
        } else if (valueA === "") {
            return 1;
        } else if (valueB === "") {
            return -1;
        } else if (!isNaN(valueA as number) && !isNaN(valueB as number)) {
            return parseInt(valueA as string) - parseInt(valueB as string);
        } else {
            return (valueA as string).localeCompare(valueB as string);
        }
    }
}

const employeeDashboard = new EmployeeDashboard();
(window as any).employeeDashboard = employeeDashboard;

export default initializeEmployee;