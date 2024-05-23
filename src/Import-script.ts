import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CellService } from './modules/cell/cell.service';
import { ColService } from './modules/col/col.service';
import { ItemService } from './modules/item/item.service';
import { RowService } from './modules/row/row.service';
import { FormatService } from './modules/format/format.service';
import { UserService } from './modules/user/user.service';
import { TxService } from './modules/tx/tx.service';
import { PageService } from './modules/page/page.service';

//Import Function
async function runImport() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const importCellService = app.get(CellService);
        const importColService = app.get(ColService);
        const importItemService = app.get(ItemService);
        const importRowService = app.get(RowService);
        const importformateService = app.get(FormatService);
        const importuserService = app.get(UserService);
        const importTXService = app.get(TxService);
        const importPageService = app.get(PageService);


        const filePath = './db.xlsx';

        await importCellService.importData(filePath);
        await importColService.importData(filePath);
        await importItemService.importData(filePath);
        await importRowService.importData(filePath);
        await importformateService.importData(filePath);
        await importuserService.importData(filePath);
        await importTXService.importData(filePath);
        await importPageService.importData(filePath)

        console.log('Import completed successfully.');
    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        await app.close();
    }
}

runImport();

