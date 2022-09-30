import { Button, Checkbox, Space } from 'antd';
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
                <Checkbox
                    checked={printElements.navLog}
                    onChange={(v) =>
                        setPrintElements((elements) => ({
                            ...elements,
                            navLog: v.target.checked,
                        }))
                    }
                    id="print-navlog"
                >
                    Log de Navigation
                </Checkbox>
            </div>
            <div>
                <Checkbox
                    type="checkbox"
                    checked={printElements.verticalProfile}
                    onChange={(v) =>
                        setPrintElements((elements) => ({
                            ...elements,
                            verticalProfile: v.target.checked,
                        }))
                    }
                    id="print-vertical-profile"
                >
                    Profile Vertical
                </Checkbox>
            </div>
            <div>
                <Checkbox
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
                >
                    Cartes IGN 2022 1/ 500 000 ème
                </Checkbox>
            </div>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Button
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
                </Button>
                <PrintButton
                    type="primary"
                    disabled={chartsLoading}
                    onClick={() => window.print()}
                    loading={chartsLoading}
                >
                    {chartsLoading ? 'Chargement des cartes...' : 'Imprimer le dossier'}
                </PrintButton>
            </Space>
        </PrintDiv>
    );
};

const PrintDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-self: flex-end;
`;

const PrintButton = styled(Button)``;
