//local Storage Accessor functions
class LocalStorageService {

    static setData<T>(data: T, key: string): void {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static getData<T>(key: string): T {
        let data: any = localStorage.getItem(key);
        if (data === null || data === undefined) {
            return [] as T;
        }
        return <T>JSON.parse(data);
    }

}
export default LocalStorageService;

