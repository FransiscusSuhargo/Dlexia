import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpubReaderPage } from './epub-reader.page';

describe('EpubReaderPage', () => {
  let component: EpubReaderPage;
  let fixture: ComponentFixture<EpubReaderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubReaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
