import { defaultDepartment } from "./constants/index";
import { IEmployee, IDepartment } from "./types/index";
import LocalStorageService from './utils/localStorageService';
import checkImageSize from "./utils/checkImageSize";
import convertFileToBase64 from "./utils/convertFileToBase64";
import { departmentsAndRoles } from "./constants/index";

// Function to dynamically insert roles
const displayRoleDropdown = (department: string): void => {
    if (LocalStorageService.getData<IDepartment[]>('departmentsAndRoles').length === 0) {
        LocalStorageService.setData<IDepartment[]>(departmentsAndRoles, 'departmentsAndRoles');
    }
    const departmentsAndRolesData = LocalStorageService.getData<IDepartment[]>('departmentsAndRoles');
    const roleContainer = document.getElementById('rolesContainer');

    if (roleContainer) {
        roleContainer.innerHTML = '';
        const selectedDepartmentData = departmentsAndRolesData.find(data => data.department && data.department.includes(department));

        if (selectedDepartmentData && selectedDepartmentData.roles) {
            roleContainer.innerHTML = `
                <label for="role" class="form-input-label" id="roles">Job Title</label><br />
                <select name="role" id="role" class="emp-info-selector">
                    ${selectedDepartmentData.roles.map(role => `<option value="${role}">${role}</option>`).join('')}
                </select>
            `;
        }
    }
};


const initializeAddEmployee = (): void => {
    displayRoleDropdown(defaultDepartment);

    const deptDropdown = document.getElementById('dept');
    if (deptDropdown) {
        deptDropdown.addEventListener('change', (event) => {
            displayRoleDropdown((event.target as HTMLSelectElement).value);
        });
    }
    const input = document.getElementById('img');
    if (input) {
        input.addEventListener('change', (event) => {
            const isImageSizeInLimits = checkImageSize(event);
            if (isImageSizeInLimits) {
                addEmployeeForm.displayImagePreview(null);
            }
        });
    }
    const addEmpForm = document.getElementById('submit');
    if (addEmpForm) {
        addEmpForm.addEventListener('click', addEmployeeForm.handleFormSubmission);
    }
    // For edit-mode/view-mode
    const urlParams = new URLSearchParams(window.location.search);
    const empNo = urlParams.get('empNo');
    const viewMode = urlParams.get('viewMode');

    if (empNo) {
        addEmployeeForm.fetchAndPopulateEmployeeData(empNo, viewMode);
    }
};

class AddEmployee {
    fetchAndPopulateEmployeeData = (empNo: string, viewMode: string | null): void => {
        const employeeRecords = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');
        const selectedEmployee = employeeRecords.find(employee => employee.empNo === empNo)!;

        const form = document.getElementById('add-employee-form') as HTMLFormElement;
        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
            if (selectedEmployee.hasOwnProperty(key)) {
                switch (key) {
                    case 'img':
                        this.displayImagePreview(selectedEmployee[key] as string);
                        break;
                    case 'dept':
                        this.updateElementValue(key, selectedEmployee[key]);
                        displayRoleDropdown(selectedEmployee[key] as string);
                        break;
                    default:
                        this.updateElementValue(key, selectedEmployee[key]);
                        break;
                }
            }
        }

        const roleInput = document.getElementById('role') as HTMLSelectElement;
        if (roleInput) {
            roleInput.value = selectedEmployee.role;
        }

        // Disable empNo input field
        this.disableFormInputFields(viewMode);
    };

    private updateElementValue(key: string, value: string | boolean): void {
        const element = document.getElementById(key) as HTMLInputElement;
        if (typeof value === 'string' && element) {
            element.value = value;
        }
    }

    disableFormInputFields = (viewMode: string | null): void => {
        const empNoInput = document.getElementById('empNo') as HTMLInputElement | null;
        if (empNoInput) {
            if (viewMode === 'true') {
                // Disable all input elements
                document.querySelectorAll('input').forEach(input => (input as HTMLInputElement).disabled = true);
                this.displayViewModeBtns();
            } else {
                // Disable only the empNoInput element
                empNoInput.disabled = true;
                this.displayEditModeBtns();
            }
        }
    };

    displayViewModeBtns = () => {
        const submitButton = document.getElementById('submit') as HTMLButtonElement | null;
        submitButton!.style.display = "none";
        this.modifyCancelButton(true);
    }
    displayEditModeBtns = () => {
        const submitButton = document.getElementById('submit') as HTMLButtonElement | null;
        if (submitButton) {
            submitButton.innerText = 'Update';
            this.modifyCancelButton();
        }
    }
    modifyCancelButton = (type?: boolean): void => {
        const btnCancel = document.getElementById('btnCancel') as HTMLButtonElement | null;
        if (btnCancel) {
            if (type) {
                btnCancel.innerText = 'Back';
                btnCancel.onclick = (event) => {
                    window.location.href = './index.html';
                };
            } else {
                btnCancel.onclick = (event) => {
                    window.location.reload();
                };
            }
        }
    };

    validateForm = (event: Event): boolean => {
        event.preventDefault();
        const requiredFieldIds = ["empNo", "fname", "lname", "email", "joinDate"];
        let flag = true;

        requiredFieldIds.forEach((id) => {
            const field = document.getElementById(id) as HTMLInputElement | null;
            const errorMessage = field?.nextElementSibling;

            if (!field || field.type === 'file') return;

            const isEmpty = field.value.trim() === "";
            const pattern = field.getAttribute('pattern');

            if (errorMessage) {
                if (isEmpty || (pattern && !new RegExp(pattern).test(field.value.trim()))) {
                    errorMessage.textContent = isEmpty ? "⚠ This Field is required" : "⚠" + field.getAttribute('title');
                    errorMessage.classList.add('show');
                    field.classList.add('error');
                    flag = false;
                } else {
                    errorMessage.textContent = ""; // Clear error message
                    errorMessage.classList.remove('show');
                    field.classList.remove('error');
                }
            }
        });

        return flag;
    };

    handleFormSubmission = (e: Event): void => {
        e.preventDefault();
        if (!this.validateForm(e)) return;

        const addEmpForm = document.getElementById("add-employee-form") as HTMLFormElement;
        const employeeRecords = LocalStorageService.getData<IEmployee[]>('EmployeeRecords');

        const formData = Object.fromEntries(new FormData(addEmpForm)) as IEmployee;
        formData.status = "Active";
        formData.isChecked = false;

        const profileImageFile = (document.getElementById("img") as HTMLInputElement).files?.[0];
        const urlParams = new URLSearchParams(window.location.search);
        const empNo = urlParams.get('empNo');

        if (empNo) {
            const existingIndex = employeeRecords.findIndex(employee => employee.empNo === empNo);
            const existingEmployee = employeeRecords[existingIndex];
            formData.empNo = empNo;
            formData.img = existingEmployee.img;
            employeeRecords.splice(existingIndex, 1);
        }

        if (profileImageFile) {
            convertFileToBase64(profileImageFile)
                .then(base64 => {
                    formData.img = base64;
                    employeeRecords.push(formData);
                    this.addEmployee(employeeRecords);
                })
                .catch(error => {
                    console.error("Error reading file:", error);
                });
        } else {
            employeeRecords.push(formData);
            this.addEmployee(employeeRecords);
        }
    };


    addEmployee = (data: IEmployee[]): void => {
        LocalStorageService.setData<IEmployee[]>(data, 'EmployeeRecords');
        window.location.href = './index.html';
    };

    // Profile preview
    displayImagePreview = (source: string | null): void => {
        if (source !== null) {
            document.getElementById("defaultProfile")?.setAttribute('src', source);
        } else {
            const image = (document.getElementById("img") as HTMLInputElement).files?.[0];
            if (image) {
                const url = URL.createObjectURL(image);
                document.getElementById("defaultProfile")?.setAttribute('src', url);
            }
        }
    };


}
const addEmployeeForm = new AddEmployee();
(window as any).addEmployeeForm = addEmployeeForm;

export default initializeAddEmployee;