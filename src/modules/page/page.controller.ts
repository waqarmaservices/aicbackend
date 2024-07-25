import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { PageService } from './page.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Page } from './page.entity';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  async createPage(): Promise<ApiResponse<Page>> {
    try {
      const page = await this.pageService.createPage();
      return new ApiResponse(true, page, '', HttpStatus.CREATED);
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
  async findOne(@Param('id') id: number): Promise<ApiResponse<Page>> {
    try {
      const page = await this.pageService.findOne(id);
      if (!page) {
        return new ApiResponse(false, null, 'Page not found', HttpStatus.NOT_FOUND);
      }
      return new ApiResponse(true, page, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updatePage(@Param('id') id: number, @Body() updateData: Partial<Page>): Promise<ApiResponse<Page>> {
    try {
      const updatedPage = await this.pageService.updatePage(id, updateData);
      return new ApiResponse(true, updatedPage, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deletePage(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.pageService.deletePage(id);
      return new ApiResponse(true, null, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('full/:pageId')
  async getonePageData(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getonePageData(pageId);
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
  @Get('columns/:pageId')
  async getPageColumns(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getPageColumns(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }

  @Get('fullcolumns/:pageId')
  async getOneCollPageData(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOneCollPageData(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  @Get('fulltocken/:pageId')
  async getOnePageAllTokens(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePageAllTokens(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  @Get('fulllanguages/:pageId')
  async getOnePageAlllanguages(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePageAlllanguages(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  @Get('fullregion/:pageId')
  async getOnePageAllregions(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePageAllregions(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  @Get('fullsupplier/:pageId')
  async getOnePageAllsupplier(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePageAllsupplier(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  @Get('fullmodels/:pageId')
  async getOnePageAllmodels(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePageAllmodels(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  @Get('fullunits/:pageId')
  async getOnePageAllunits(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePageAllunits(pageId);
      return new ApiResponse(true, data, '', 200);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', 500);
    }
  }
  @Get('fulllabes/:pageId')
  async getOnePageAlllabes(@Param('pageId') pageId: number): Promise<ApiResponse<any>> {
    try {
      const data = await this.pageService.getOnePageAlllabes(pageId);
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
}
