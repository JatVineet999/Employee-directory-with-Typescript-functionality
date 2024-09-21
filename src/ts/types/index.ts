// Structure for departmentsAndRoles
interface IDepartment {
    department: string;
    roles: string[];
}
//interface for employee-records
interface IEmployee {
    [key: string]: string | boolean;
    dept: string;
    description: string;
    dob: string;
    email: string;
    empNo: string;
    fname: string;
    isChecked: boolean
    img: string;
    joinDate: string;
    lname: string;
    location: string;
    managerAssigned: string;
    mobile: string;
    projectAssigned: string;
    role: string;
    status: string;
}
interface ISelectedFilter {
    char: string;
    status: string;
    location: string;
    department: string;
}
export { IDepartment, IEmployee, ISelectedFilter };