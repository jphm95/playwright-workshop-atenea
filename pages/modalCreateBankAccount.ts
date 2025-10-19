import { Page, Locator } from '@playwright/test';

export class ModalCreateBankAccount {
    readonly page: Page;
    readonly dropdownAccountType: Locator;
    readonly addAccountButton: Locator;
    readonly quantityInput: Locator;
    readonly cancelButton: Locator;
    readonly createAccountButton: Locator;


    constructor(page: Page) {
        this.page = page;
        this.dropdownAccountType = page.getByRole('combobox', {name: "Tipo de cuenta"} );
        this.addAccountButton = page.getByTestId('boton-agregar-fondos');
        this.quantityInput = page.getByRole('spinbutton', { name: 'Monto inicial *' });
        this.cancelButton = page.getByTestId('boton-cancelar-crear-cuenta');
        this.createAccountButton = page.getByTestId('boton-crear-cuenta');
    
    }

    async navigateToDashboardPage() {
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('networkidle');
    } 

    async selectAccountType(accountType: string) {
        await this.dropdownAccountType.click();
        await this.page.getByRole('option', {name: accountType }).click();
    }

    async addQuantity(quantity: string){
        await this.quantityInput.fill(quantity);
    }

}
