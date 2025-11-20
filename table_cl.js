import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';

interface Data {
  id: number;
  calories: number;
  carbs: number;
  fat: number;
  name: string;
  protein: number;
}

function createData(
  id: number,
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
): Data {
  return {
    id,
    name,
    calories,
    fat,
    carbs,
    protein,
  };
}

const rows = [
  createData(1, 'Cupcake', 305, 3.7, 67, 4.3),
  createData(2, 'Donut', 452, 25.0, 51, 4.9),
  createData(3, 'Eclair', 262, 16.0, 24, 6.0),
  createData(4, 'Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData(5, 'Gingerbread', 356, 16.0, 49, 3.9),
  createData(6, 'Honeycomb', 408, 3.2, 87, 6.5),
  createData(7, 'Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData(8, 'Jelly Bean', 375, 0.0, 94, 0.0),
  createData(9, 'KitKat', 518, 26.0, 65, 7.0),
  createData(10, 'Lollipop', 392, 0.2, 98, 0.0),
  createData(11, 'Marshmallow', 318, 0, 81, 2.0),
  createData(12, 'Nougat', 360, 19.0, 9, 37.0),
  createData(13, 'Oreo', 437, 18.0, 63, 4.0),
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Dessert (100g serving)',
  },
  {
    id: 'calories',
    numeric: true,
    disablePadding: false,
    label: 'Calories',
  },
  {
    id: 'fat',
    numeric: true,
    disablePadding: false,
    label: 'Fat (g)',
  },
  {
    id: 'carbs',
    numeric: true,
    disablePadding: false,
    label: 'Carbs (g)',
  },
  {
    id: 'protein',
    numeric: true,
    disablePadding: false,
    label: 'Protein (g)',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              // RGAA 4.1.2 – Critère 11.1 : Label accessible pour la checkbox de sélection globale
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            // RGAA 4.1.2 – Critère 5.7 : Définition de l'en-tête de colonne
            scope="col"
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              // RGAA 4.1.2 – Critère 7.1 : Instructions explicites sur l'interactivité du tri
              aria-label={`Sort by ${headCell.label}`}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  onDelete?: () => void;
  onFilter?: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, onDelete, onFilter } = props;
  
  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
      // RGAA 4.1.2 – Critère 12.6 : Zone de regroupement d'informations identifiée
      role="region"
      aria-label="Table toolbar"
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
          // RGAA 4.1.2 – Critère 7.1 : Annonce du nombre de sélections
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Nutrition
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          {/* RGAA 4.1.2 – Critère 1.3 : Ajout d'aria-label pour les boutons icônes */}
          <IconButton 
            aria-label="Delete selected items"
            onClick={onDelete}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          {/* RGAA 4.1.2 – Critère 1.3 : Ajout d'aria-label pour les boutons icônes */}
          <IconButton 
            aria-label="Filter list"
            onClick={onFilter}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default function EnhancedTable() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('calories');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
  // RGAA 4.1.2 – Critère 7.1 : Message d'annonce pour les changements dynamiques
  const [statusMessage, setStatusMessage] = React.useState('');

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    
    // RGAA 4.1.2 – Critère 7.1 : Annonce du changement de tri
    const columnLabel = headCells.find(cell => cell.id === property)?.label || property;
    setStatusMessage(`Table sorted by ${columnLabel}, ${newOrder}ending order`);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      // RGAA 4.1.2 – Critère 7.1 : Annonce de la sélection globale
      setStatusMessage(`All ${rows.length} items selected`);
      return;
    }
    setSelected([]);
    setStatusMessage('All items deselected');
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
    
    // RGAA 4.1.2 – Critère 7.1 : Annonce du changement de sélection
    const itemName = rows.find(row => row.id === id)?.name || 'item';
    const action = selectedIndex === -1 ? 'selected' : 'deselected';
    setStatusMessage(`${itemName} ${action}. ${newSelected.length} items selected`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    // RGAA 4.1.2 – Critère 7.1 : Annonce du changement de page
    setStatusMessage(`Page ${newPage + 1} of ${Math.ceil(rows.length / rowsPerPage)}`);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // RGAA 4.1.2 – Critère 7.1 : Annonce du changement de nombre de lignes
    setStatusMessage(`Displaying ${newRowsPerPage} rows per page`);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const handleDelete = () => {
    // Fonction de suppression (à implémenter selon les besoins)
    setStatusMessage(`${selected.length} items deleted`);
    setSelected([]);
  };

  const handleFilter = () => {
    // Fonction de filtrage (à implémenter selon les besoins)
    setStatusMessage('Filter dialog opened');
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* RGAA 4.1.2 – Critère 7.1 : Région live pour les annonces aux lecteurs d'écran */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {statusMessage}
      </div>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar 
          numSelected={selected.length}
          onDelete={handleDelete}
          onFilter={handleFilter}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            // RGAA 4.1.2 – Critère 5.4 : Ajout d'un titre descriptif pour le tableau
            aria-describedby="tableDescription"
          >
            {/* RGAA 4.1.2 – Critère 5.4 : Caption pour décrire le contenu du tableau */}
            <caption id="tableDescription" style={{ 
              position: 'absolute',
              left: '-10000px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}>
              Nutrition information table for various desserts. Columns include dessert name, calories, fat, carbs, and protein per 100g serving. Table is sortable and allows row selection.
            </caption>
            
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                    // RGAA 4.1.2 – Critère 7.3 : Label descriptif pour la ligne
                    aria-label={`Select ${row.name}`}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          // RGAA 4.1.2 – Critère 11.1 : Association avec le label de la ligne
                          'aria-labelledby': labelId,
                        }}
                        // RGAA 4.1.2 – Critère 7.3 : Exclusion de la navigation tab (la ligne est cliquable)
                        tabIndex={-1}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.calories}</TableCell>
                    <TableCell align="right">{row.fat}</TableCell>
                    <TableCell align="right">{row.carbs}</TableCell>
                    <TableCell align="right">{row.protein}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                  // RGAA 4.1.2 – Critère 10.7 : Masquage des lignes vides pour les AT
                  aria-hidden="true"
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          // RGAA 4.1.2 – Critère 7.1 : Labels accessibles pour la pagination
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>
      
      <FormControlLabel
        control={
          <Switch 
            checked={dense} 
            onChange={handleChangeDense}
            // RGAA 4.1.2 – Critère 11.1 : ID pour association explicite avec le label
            id="dense-padding-switch"
            // RGAA 4.1.2 – Critère 7.1 : Description de l'état du switch
            inputProps={{
              'aria-label': 'Toggle dense padding',
            }}
          />
        }
        label="Dense padding"
        // RGAA 4.1.2 – Critère 11.1 : Association explicite du label avec le contrôle
        htmlFor="dense-padding-switch"
      />
    </Box>
  );
}
