export interface SeasonItem {
  id: string
  title: string
  pdfPath: string
}

export interface Season {
  id: string
  title: string
  subtitle: string
  color: string
  bannerImage: string
  items: SeasonItem[]
}

export const MATE_SEASON_2: Season = {
  id: 'mate-2',
  title: 'Mate Mania',
  subtitle: 'Temporada 2 — Prepara tu examen de mates',
  color: '#ff6b35',
  bannerImage: '/images/mate-seasons-2.png',
  items: [
    { id: 'ms2-01', title: 'Problemas 1', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates1.pdf' },
    { id: 'ms2-02', title: 'Problemas 2', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates2.pdf' },
    { id: 'ms2-03', title: 'Problemas 3', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates3.pdf' },
    { id: 'ms2-04', title: 'Problemas 4', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates4.pdf' },
    { id: 'ms2-05', title: 'Problemas 5', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates5.pdf' },
    { id: 'ms2-06', title: 'Problemas 6', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates6.pdf' },
    { id: 'ms2-07', title: 'Problemas 7', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates7.pdf' },
    { id: 'ms2-08', title: 'Problemas 8', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates8.pdf' },
    { id: 'ms2-09', title: 'Problemas 9', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates9.pdf' },
    { id: 'ms2-10', title: 'Problemas 10', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates10.pdf' },
    { id: 'ms2-11', title: 'Problemas 11', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates11.pdf' },
    { id: 'ms2-12', title: 'Problemas 12', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates12.pdf' },
    { id: 'ms2-13', title: 'Problemas 13', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates13.pdf' },
    { id: 'ms2-14', title: 'Problemas 14', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates14.pdf' },
    { id: 'ms2-15', title: 'Problemas 15', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates15.pdf' },
    { id: 'ms2-16', title: 'Problemas 16', pdfPath: '/2ESO_Matematicas/Mate Season 2/Mates16.pdf' },
  ],
}
