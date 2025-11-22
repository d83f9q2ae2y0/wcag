   <Collapse in={priceAlert !== null}>
            {priceAlert && (
              <Alert
                severity="warning"
                icon={<Warning sx={{ fontSize: 32 }} />}
                sx={{
                  mb: 3,
                  '& .MuiAlert-message': {
                    width: '100%'
                  },
                  border: 2,
                  borderColor: 'warning.main',
                  boxShadow: '0 4px 20px rgba(237, 108, 2, 0.3)'
                }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setPriceAlert(null)}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                <AlertTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  Price Changed!
                </AlertTitle>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Expected Price
                    </Typography>
                    <Typography variant="h6" sx={{ textDecoration: 'line-through' }}>
                      ${priceAlert.expectedPrice.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Actual Price
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: priceAlert.increased ? 'error.main' : 'success.main'
                      }}
                    >
                      ${priceAlert.actualPrice.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      bgcolor: priceAlert.increased ? 'error.light' : 'success.light',
                      borderRadius: 1
                    }}
                  >
                    {priceAlert.increased ? (
                      <TrendingUp sx={{ color: 'error.dark' }} />
                    ) : (
                      <TrendingDown sx={{ color: 'success.dark' }} />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: priceAlert.increased ? 'error.dark' : 'success.dark'
                      }}
                    >
                      {priceAlert.increased ? '+' : ''}${priceAlert.difference.toFixed(2)} (
                      {priceAlert.increased ? '+' : ''}{priceAlert.percentChange}%)
                    </Typography>
                  </Box>
                </Stack>
              </Alert>
            )}
          </Collapse>
