import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus, Res, HttpException } from '@nestjs/common';
import { PageService } from './page.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Page } from './page.entity';
import { Response } from 'express';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  async createPage(@Body() body: { cols: number[] }): Promise<ApiResponse<any>> {
    const { cols } = body;
    if (!Array.isArray(cols) || !cols.every((col) => typeof col === 'number')) {
      return new ApiResponse(false, null, 'Invalid input: cols must be an array of bigints', HttpStatus.BAD_REQUEST);
    }

    try {
      const page = await this.pageService.createPage(cols);
      if (!page) {
        return new ApiResponse(false, null, 'Page not Created', HttpStatus.NOT_FOUND);
      }

      const data = {
        Page: {
          Pg: page.Pg,
          Cols: page.Cols,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    try {
      const pages = await this.pageService.getAllPages();
      return new ApiResponse(true, pages, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const page = await this.pageService.findOne(id);
      if (!page) {
        return new ApiResponse(false, null, 'Page not found', HttpStatus.NOT_FOUND);
      }

      // Wrap the Pg attribute inside the Page object
      const data = {
        Page: {
          Pg: page.Pg,
          Cols: page.Cols,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updatePage(@Param('id') id: number, @Body() updateData: Partial<Page>): Promise<ApiResponse<any>> {
    try {
      // Call the service to update and get the updated page by Pg
      const updatedPage = await this.pageService.updatePage(id, updateData);

      // If the page is not found after the update, return a 404 error
      if (!updatedPage) {
        return new ApiResponse(false, null, 'Page not found', HttpStatus.NOT_FOUND);
      }

      // Wrap the Pg attribute inside the Page object for the response
      const data = {
        updated_Page: {
          Pg: updatedPage.Pg,
          Cols: updatedPage.Cols,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deletePage(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const deletedPg = await this.pageService.deletePage(id);

      // If the page was not found (i.e., deletedPg is null), return a 404 response
      if (!deletedPg) {
        return new ApiResponse(false, null, 'Page not found', HttpStatus.NOT_FOUND);
      }

      // Wrap the deleted Pg ID inside the Deleted_Page object
      const data = {
        Deleted_Page: {
          Pg: deletedPg,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('content/:pageId')
  async getonePageData(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getonePageData(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds Pg Cols based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  @Get('columns/:pageId')
  async getPageColumns(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getPageColumns(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }

  @Put('clearcache/:pageId')
  async clearPageCache(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.clearPageCache(pageId.toString());
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }

  @Get('page/:pageId')
  async getOnePage(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePage(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  /**
   * Finds Pg Cols based on provided Pg ID.
   *
   * @param {number} pageId - The ID of the PG to find.
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */

  @Get('colid/:pageId')
  async getPageColumnsids(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getPageColumnsids(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  // Create Page with Format record
  @Post('createpageformat')
  async createPageWithFormat(@Body() body: { cols: number[] }): Promise<ApiResponse<any>> {
    const { cols } = body;
    if (!Array.isArray(cols) || !cols.every((col) => typeof col === 'number')) {
      return new ApiResponse(false, null, 'Invalid input: cols must be an array of bigints', HttpStatus.BAD_REQUEST);
    }

    try {
      // Call the service to create the Page and Format
      const result = await this.pageService.createPageWithFormat(cols);

      // Structure the response data
      const responseData = {
        PageFormat: {
          Page: {
            Pg: result.createdPage.Pg,
          },
          Format: {
            Format: result.createdFormat.Format,
            Object: result.createdFormat.Object,
            User: result.createdFormat.User,
            ObjectType: result.createdFormat.ObjectType,
            PgCols: result.createdFormat.PgCols, // Include PgCols in the response
          },
        },
      };

      return new ApiResponse(true, responseData, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handles updating the order of columns for a given page.
   *
   * @param {number} Pg - The page identifier.
   * @param {Object} body - The request body containing the updated column order.
   * @param {number[]} body.PgCols - An array of column identifiers in the new order.
   *
   * @description
   * This method updates the order of columns for the specified page (`Pg`). It first validates the input to ensure
   * `PgCols` is an array of numbers. If the input is valid, the method calls the `pageService.updatePageColsOrder`
   * method to perform the update. The response data includes the updated format information for the page.
   * If an error occurs, a relevant error message is returned.
   *
   * @returns {Promise<ApiResponse>} The reponse of Pg Cols.
   */
  @Put(':Pg/updatePageColsOrder')
  async updatePageColsOrder(@Param('Pg') Pg: number, @Body() body: { PgCols: number[] }) {
    try {
      const { PgCols } = body;
      if (!Array.isArray(PgCols) || !PgCols.length || !PgCols.every((col) => typeof col === 'number')) {
        return new ApiResponse(false, null, 'Invalid input: cols must be an array of number', HttpStatus.BAD_REQUEST);
      }
      // Call the service to update the Pg cols in tFormat
      const pgFormatRecord = await this.pageService.updatePageColsOrder(Pg, PgCols);

      // Structure the response data
      const responseData = {
        Pg: {
          Pg: pgFormatRecord.Object,
        },
        Format: pgFormatRecord,
      };

      return new ApiResponse(true, responseData, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('dds/regions')
  async getRegions(@Res() res: Response) {
    try {
      const data = await this.pageService.getRegions();
      return res.status(HttpStatus.OK).json(new ApiResponse(true, data, '', HttpStatus.OK));
    } catch (error) {
      throw error;
    }
  }
  
  @Get('languages/:pageId')
  async getlanguages(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getlanguages(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      console.error('Error in getOnePage controller:', error); // Logging the error
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }

}
