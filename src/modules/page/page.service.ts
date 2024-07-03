import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Page } from './page.entity';
import { Item } from 'modules/item/item.entity';
import ts from 'typescript';

@Injectable()
export class PageService {
    constructor(
        @InjectRepository(Page)
        private readonly pageRepository: Repository<Page>,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async createPage(): Promise<Page> {
        const pageData = this.pageRepository.create();
        return this.pageRepository.save(pageData);
    }

    async findAll(): Promise<any> {
        return this.pageRepository.find();
    }

    async findOne(id: number): Promise<Page> {
        return this.pageRepository.findOne({ where: { PG: id } });
    }

    async updatePage(id: number, updateData: Partial<Page>): Promise<Page> {
        await this.pageRepository.update(id, updateData);
        return this.findOne(id);
    }

    async deletePage(id: number): Promise<void> {
        await this.pageRepository.delete(id);
    }
    async getOnePage(pageId: number): Promise<any> {
        try {
            const page = await this.entityManager.findOne(Page, {
                where: { PG: pageId },
                relations: ['rows', 'rows.cells', 'rows.cells.Col'],
            });

            if (!page) {
                throw new Error('Page not found');
            }

            // Extract all item IDs from cells
            const itemIdsSet = new Set<number>();
            for (const row of page.rows) {
                for (const cell of row.cells) {
                    if (cell.Items) {
                        let itemsArray: number[] = [];

                        // Ensure cell.Items is handled correctly based on its type
                        if (typeof cell.Items === 'string') {
                            //@ts-ignore
                            itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                                .split(',')
                                .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
                        } else if (Array.isArray(cell.Items)) {
                            itemsArray = cell.Items as number[];
                        }

                        itemsArray.forEach((itemId) => itemIdsSet.add(itemId));
                    }
                }
            }
            const itemIds = Array.from(itemIdsSet);

            // Retrieve the complete records of each item ID
            const items = await this.entityManager.findByIds(Item, itemIds);

            // Replace item IDs in cells with full item records
            for (const row of page.rows) {
                for (const cell of row.cells) {
                    if (cell.Items) {
                        let itemsArray: number[] = [];

                        // Ensure cell.Items is handled correctly based on its type
                        if (typeof cell.Items === 'string') {
                            // @ts-ignore
                            itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                                .split(',')
                                .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
                        } else if (Array.isArray(cell.Items)) {
                            itemsArray = cell.Items as number[];
                        }

                        cell.Items = itemsArray.map(
                            (itemId) =>
                                items.find((item) => item.Item === itemId) ||
                                itemId,
                        ) as any;
                    }
                }
            }

            return {
                success: true,
                data: {
                    page,
                },
                error: '',
                statusCode: 200,
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                data: null,
                error: (error as Error).message,
                statusCode: 500,
            };
        }
    }
    // async getAllPagesData(): Promise<any> {
    //     try {
    //         const page = await this.entityManager.find(Page, {
                

    //             relations: [
    //                 'rows',
    //                 'rows.cells',
    //                 'rows.cells.Col',
    //                 'rows.cells.items',
    //             ],
    //         });
    //         if (!page) {
    //             throw new Error('Page not found');
    //         }
    //         // Extract all item IDs from cells
    //         const itemIdsSet = new Set<number>();
    //         for (const row of page.rows) {
    //             for (const cell of row.cells) {
    //                 if (cell.Items) {
    //                     let itemsArray: number[] = [];

    //                     // Ensure cell.Items is handled correctly based on its type
    //                     if (typeof cell.Items === 'string') {
    //                         //@ts-ignore
    //                         itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
    //                             .split(',')
    //                             .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
    //                     } else if (Array.isArray(cell.Items)) {
    //                         itemsArray = cell.Items as number[];
    //                     }

    //                     itemsArray.forEach((itemId) => itemIdsSet.add(itemId));
    //                 }
    //             }
    //         }
    //         const itemIds = Array.from(itemIdsSet);
    //         // Retrieve the complete records of each item ID
    //         const items = await this.entityManager.findByIds(Item, itemIds);

    //         // Replace item IDs in cells with full item records
    //         for (const row of page.rows) {
    //             for (const cell of row.cells) {
    //                 if (cell.Items) {
    //                     let itemsArray: number[] = [];

    //                     // Ensure cell.Items is handled correctly based on its type
    //                     if (typeof cell.Items === 'string') {
    //                         // @ts-ignore
    //                         itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
    //                             .split(',')
    //                             .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
    //                     } else if (Array.isArray(cell.Items)) {
    //                         itemsArray = cell.Items as number[];
    //                     }

    //                     cell.Items = itemsArray.map(
    //                         (itemId) =>
    //                             items.find((item) => item.Item === itemId) ||
    //                             itemId,
    //                     ) as any;
    //                 }
    //             }
    //         }

    //         return {
    //             success: true,
    //             data: {
    //                 page,
    //             },
    //             error: '',
    //             statusCode: 200,
    //         };
    //     } catch (error) {
    //         console.error(error);
    //         return {
    //             success: false,
    //             data: null,
    //             error: (error as Error).message,
    //             statusCode: 500,
    //         };
    //     }
    // }

    async getAllPages(): Promise<any> {
        try {
            const pages = await this.entityManager.find(Page, {
                relations: ['rows', 'rows.cells', 'rows.cells.Col'],
            });
    
            if (!pages || pages.length === 0) {
                throw new Error('No pages found');
            }
    
            // Process each page to extract and retrieve full item records
            for (const page of pages) {
                const itemIdsSet = new Set<number>();
                for (const row of page.rows) {
                    for (const cell of row.cells) {
                        if (cell.Items) {
                            let itemsArray: number[] = [];
    
                            // Ensure cell.Items is handled correctly based on its type
                            if (typeof cell.Items === 'string') {
                                //@ts-ignore
                                itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                                    .split(',')
                                    .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
                            } else if (Array.isArray(cell.Items)) {
                                itemsArray = cell.Items as number[];
                            }
    
                            itemsArray.forEach((itemId) => itemIdsSet.add(itemId));
                        }
                    }
                }
    
                const itemIds = Array.from(itemIdsSet);
                const items = await this.entityManager.findByIds(Item, itemIds);
    
                // Replace item IDs in cells with full item records
                for (const row of page.rows) {
                    for (const cell of row.cells) {
                        if (cell.Items) {
                            let itemsArray: number[] = [];
    
                            // Ensure cell.Items is handled correctly based on its type
                            if (typeof cell.Items === 'string') {
                                //@ts-ignore
                                itemsArray = cell.Items.replace(/[{}]/g, '') // Remove braces
                                    .split(',')
                                    .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
                            } else if (Array.isArray(cell.Items)) {
                                itemsArray = cell.Items as number[];
                            }
    
                            cell.Items = itemsArray.map(
                                (itemId) =>
                                    items.find((item) => item.Item === itemId) ||
                                    itemId,
                            ) as any;
                        }
                    }
                }
            }
    
            return {
                success: true,
                data: {
                    pages,
                },
                error: '',
                statusCode: 200,
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                data: null,
                error: (error as Error).message,
                statusCode: 500,
            };
        }
    }
    
}