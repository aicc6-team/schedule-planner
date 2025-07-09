export interface PersonalSchedule {
    id?: string;
    title: string;
    description: string;
    date: string;
    time: string;
    durationMinutes: number;
    importance: string;
    emotion: string;
    projectId: string;
    assignee: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface DepartmentSchedule {
    id?: string;
    title: string;
    objective: string;
    date: string;
    time: string;
    participants: string[];
    department: string;
    projectId: string;
    organizer: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface ProjectSchedule {
    id?: string;
    projectId: string;
    projectName: string;
    objective: string;
    category: string;
    startDate: string;
    endDate: string;
    time: string;
    roles: {
        pm: number;
        backend: number;
        frontend: number;
        designer: number;
        marketer: number;
        sales: number;
        general: number;
        others: number;
    };
    participants: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
}
export declare const firestoreService: {
    getPersonalSchedules(): Promise<PersonalSchedule[]>;
    getDepartmentSchedules(): Promise<DepartmentSchedule[]>;
    getProjectSchedules(): Promise<ProjectSchedule[]>;
    getAllSchedules(): Promise<{
        personal: PersonalSchedule[];
        department: DepartmentSchedule[];
        project: ProjectSchedule[];
    }>;
    createPersonalSchedule(data: Omit<PersonalSchedule, "id" | "createdAt" | "updatedAt">): Promise<PersonalSchedule>;
    getPersonalScheduleById(id: string): Promise<PersonalSchedule | null>;
    updatePersonalSchedule(id: string, data: Partial<PersonalSchedule>): Promise<PersonalSchedule | null>;
    deletePersonalSchedule(id: string): Promise<boolean>;
    createDepartmentSchedule(data: Omit<DepartmentSchedule, "id" | "createdAt" | "updatedAt">): Promise<DepartmentSchedule>;
    getDepartmentScheduleById(id: string): Promise<DepartmentSchedule | null>;
    updateDepartmentSchedule(id: string, data: Partial<DepartmentSchedule>): Promise<DepartmentSchedule | null>;
    deleteDepartmentSchedule(id: string): Promise<boolean>;
    createProjectSchedule(data: Omit<ProjectSchedule, "id" | "createdAt" | "updatedAt">): Promise<ProjectSchedule>;
    getProjectScheduleById(id: string): Promise<ProjectSchedule | null>;
    updateProjectSchedule(id: string, data: Partial<ProjectSchedule>): Promise<ProjectSchedule | null>;
    deleteProjectSchedule(id: string): Promise<boolean>;
};
//# sourceMappingURL=firestoreService.d.ts.map