import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly dashboardTitle: Locator;
    readonly addAccountButton: Locator;
    readonly sendMonyButton: Locator;
    readonly transactionsListElements: Locator;
    readonly ammountsWiredList: Locator;


    constructor(page: Page) {
        this.page = page;
        this.dashboardTitle = page.getByTestId('titulo-dashboard');
        this.addAccountButton = page.getByTestId('tarjeta-agregar-cuenta');
        this.sendMonyButton = page.getByTestId('boton-enviar')
        this.transactionsListElements = page.locator('[data-testid="descripcion-transaccion"]');
        this.ammountsWiredList = page.locator('[data-testid="monto-transaccion"]');

    }

    async navigateToDashboardPage() {
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('networkidle');
    } 

}
