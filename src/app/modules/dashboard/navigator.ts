
class Navigators {

    goAuction(id: string): string {
        return `auction/${id}`;
    }

    goChangeColor(id: string): string {
        return `change_color/${id}`;
    }
}

export const Navigator = new Navigators();
