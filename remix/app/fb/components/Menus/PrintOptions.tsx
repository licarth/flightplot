import styled from 'styled-components';
import { useMainMap } from '../Map/MainMapContext';
import { FORMATS, usePrint } from '../PrintContext';
import { useRoute } from '../useRoute';

export const PrintOptions = () => {
    const { map } = useMainMap();
    const { printElements, setPrintElements, chartsLoading } = usePrint();

    const { route, setRoute } = useRoute();
    return (
        <PrintDiv>
            <div>
                <label htmlFor="print-navlog">Log de Navigation</label>
                <input
                    type="checkbox"
                    checked={printElements.navLog}
                    onChange={(v) =>
                        setPrintElements((elements) => ({
                            ...elements,
                            navLog: v.target.checked,
                        }))
                    }
                    id="print-navlog"
                />
            </div>
            <div>
                <label htmlFor="print-vertical-profile">Profile Vertical</label>
                <input
                    type="checkbox"
                    checked={printElements.verticalProfile}
                    onChange={(v) =>
                        setPrintElements((elements) => ({
                            ...elements,
                            verticalProfile: v.target.checked,
                        }))
                    }
                    id="print-vertical-profile"
                />
            </div>
            <div>
                <label htmlFor="print-map">Zones IGN 2022 1/ 500 000 ème</label>
                <input
                    checked={printElements.charts}
                    onChange={(v) =>
                        setPrintElements((elements) => ({
                            ...elements,
                            charts: v.target.checked,
                        }))
                    }
                    disabled={chartsLoading}
                    type="checkbox"
                    id="print-map"
                />
            </div>{' '}
            <button
                onClick={() => {
                    const mapCenter = map?.getCenter();
                    mapCenter &&
                        route &&
                        setRoute(
                            (route) =>
                                route &&
                                route.addPrintArea({
                                    pageFormat: FORMATS.A4_PORTRAIT,
                                    bottomLeft: mapCenter,
                                }),
                        );
                }}
            >
                Ajouter un zone d'impression
            </button>
            <PrintButton disabled={chartsLoading} onClick={() => window.print()}>
                {chartsLoading ? '⏳ Chargement des cartes...' : 'Imprimer le dossier'}
            </PrintButton>
        </PrintDiv>
    );
};

const PrintDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-self: flex-end;
`;

const PrintButton = styled.button`
    margin-top: 10px;
    padding: 20px;
`;
