import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StandaloneEpubReaderPage } from './standalone-epub-reader.page';

describe('StandaloneEpubReaderPage', () => {
  let component: StandaloneEpubReaderPage;
  let fixture: ComponentFixture<StandaloneEpubReaderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StandaloneEpubReaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
