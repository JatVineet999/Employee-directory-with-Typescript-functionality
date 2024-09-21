import { IDepartment, IEmployee } from "./types";
import LocalStorageService from './utils/localStorageService';
const initializeAddRoles = (): void => {
    const frmRole = document.getElementById('frmRole');
    if (frmRole) {
        frmRole.addEventListener('submit', addRoles.handleRolesFormSubmission);
        const selectedEmployee = document.getElementById('assignEmp');
        if (selectedEmployee) {
            selectedEmployee.addEventListener('input', addRoles.updateEmployeeAvailable);
        }
        addRoles.updateEmployeeAvailable();
    }
};

class AddRoles {
    addEmployeeProfile = (data: IEmployee): void => {
        const employeesDiv = document.getElementById('employeesAvailable');
        if (employeesDiv) {
            const template = `
        <div class="flex-container">
        <div class="emp-info-container">
           <div class="emp-profile-container">
          <img src="${data.img
                }" alt="employee-image" class="employee-img" /></div>
            <span class="employee-name">${data.fname.charAt(0).toUpperCase() +
                data.fname.slice(1).toLowerCase()
                } ${data.lname.charAt(0).toUpperCase() + data.lname.slice(1).toLowerCase()
                }</span>
        </div>
        <div class="selected-employee">
          <input type="checkbox" name="select" class="select" id="${data.empNo}" />
        </div>
        </div>
    `;
            employeesDiv.innerHTML += template;
        }
    };


    updateEmployeeAvailable = (): void => {
        const selectedEmployee = document.getElementById('assignEmp') as HTMLInputElement;
        const employeesAvailable = document.getElementById('employeesAvailable');
        if (selectedEmployee && employeesAvailable) {
            const searchTerm = selectedEmployee.value.toLowerCase();
            const employeeArray = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');
            employeesAvailable.innerHTML = '';

            employeeArray
                .filter((employeeData) => employeeData.fname.toLowerCase().startsWith(searchTerm))
                .forEach(this.addEmployeeProfile);
        }
    };

    handleRolesFormSubmission = (event: Event): void => {
        event.preventDefault();
        const frmRole = document.getElementById('frmRole') as HTMLFormElement | null;
        if (frmRole) {
            const formData = Object.fromEntries(new FormData(frmRole)) as {
                [key: string]: string;
            };
            console.log(new FormData(frmRole));
            const selectedEmployees = this.getSelectedEmployees();
            const existingData = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');
            const departmentsAndRoles = LocalStorageService.getData<IDepartment[]>('departmentsAndRoles');
            selectedEmployees.forEach((empNo) => {
                const existingIndex = existingData.findIndex(
                    (employee) => employee.empNo === empNo
                );
                if (existingIndex !== -1) {
                    const employee = existingData[existingIndex];
                    employee.role = formData.role;
                    employee.dept = formData.dept;
                    employee.description = formData.description;
                    employee.location = formData.location;
                }
            });
            const selectedDepartment = formData.dept;
            const selectedRoles =
                departmentsAndRoles.find((data) => data.department === selectedDepartment)?.roles || [];
            if (!selectedRoles.includes(formData.role)) {
                const selectedDepartmentData = departmentsAndRoles.find(
                    (data) => data.department === selectedDepartment
                );
                if (selectedDepartmentData) {
                    selectedDepartmentData.roles.push(formData.role);
                }
            }
            LocalStorageService.setData<IEmployee[]>(existingData, 'EmployeeRecords');
            LocalStorageService.setData<IDepartment[]>(departmentsAndRoles, 'departmentsAndRoles');
            window.location.href = './index.html';
        }
    };

    getSelectedEmployees = (): string[] => {
        const checkboxes = document.getElementsByClassName('select') as HTMLCollectionOf<HTMLInputElement>;
        const selectedEmployees: string[] = [];

        for (const checkbox of checkboxes) {
            if (checkbox.checked) {
                selectedEmployees.push(checkbox.id);
            }
        }

        return selectedEmployees;
    };
}

const addRoles = new AddRoles();
(window as any).addRoles = addRoles;
export default initializeAddRoles;