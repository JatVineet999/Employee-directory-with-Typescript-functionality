import { IDepartment } from "../types";

const defaultDepartment = "UI/UX";

const departmentsAndRoles: IDepartment[] = [
    {
        department: 'UI/UX',
        roles: ['UI Designer', 'UX Designer'],
    },
    {
        department: 'Software-Development',
        roles: ['Software-Development Engineer', 'Full-stack Developer'],
    },
];
export { departmentsAndRoles, defaultDepartment };