import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly dashboardTitle: Locator;
    readonly addAccountButton: Locator;
    readonly sendMonyButton: Locator;


    constructor(page: Page) {
        this.page = page;
        this.dashboardTitle = page.getByTestId('titulo-dashboard');
        this.addAccountButton = page.getByTestId('tarjeta-agregar-cuenta');
        this.sendMonyButton = page.getByTestId('boton-enviar')
    }

    async navigateToDashboardPage() {
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('networkidle');
    } 

}
