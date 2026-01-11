import React from 'react';
import { Modal, DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { useStore } from '../store/simulationStore';

export const DataViewModal: React.FC = () => {
    const dataView = useStore(state => state.dataView);
    const setDataView = useStore(state => state.setDataView);

    if (!dataView) return null;

    const { title, columns, data } = dataView;

    // Convert data array to object array for DataTable
    const headers = columns.map(col => ({ key: col, header: col }));
    const rows = data.map((row, i) => {
        const rowObj: { id: string; [key: string]: string | number } = { id: i.toString() };
        columns.forEach((col, j) => {
            rowObj[col] = typeof row[j] === 'number' ? row[j].toFixed(4) : row[j];
        });
        return rowObj;
    });

    return (
        <Modal
            open={!!dataView}
            onRequestClose={() => setDataView(null)}
            modalHeading={title}
            passiveModal
            size="lg"
            className="gala-data-modal" // Hook for global styling if needed
        >
            <DataTable rows={rows} headers={headers}>
                {({ rows, headers, getHeaderProps, getTableProps }) => (
                    <TableContainer>
                        <Table {...getTableProps()} size="sm">
                            <TableHead>
                                <TableRow>
                                    {headers.map((header) => (
                                        <TableHeader {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DataTable>
        </Modal>
    );
};
