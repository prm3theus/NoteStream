import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
// import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';

import getWeb3 from './utils/web3';

import Create from './components/create';
import Deposit from './components/deposit';
import Status from './components/status';

import getZkAssetsForNetwork from "zkasset-metadata"
import { getContractAddressesForNetwork, abis } from "@quachtli/contract-artifacts"
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/tomafrench/quachtli-rinkeby',
  })
});

const useStyles = makeStyles(theme => ({
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(1200 + theme.spacing(2) * 2)]: {
      width: 1200,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    padding: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      padding: theme.spacing(3),
    },
  },
  pageElement: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  // button: {
  //   marginRight: theme.spacing(2),
  // },
  title: {
    flexGrow: 1,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

const App = () => {
  const classes = useStyles();
  const [account, setAccount] = useState(null);
  const [zkAsset, setZkAsset] = useState();
  const [daiBalance, setDaiBalance] = useState(0);
  const [zkdaiBalance, setZkdaiBalance] = useState(0);
  const [streamContractInstance, setStreamContractInstance] = useState(null);
  const [value, setValue] = useState(0);

  const addresses = getContractAddressesForNetwork(4)
  const zkAssets = getZkAssetsForNetwork(4)

  const updateZkAsset = async (address) => {
      async function updateBalances(zkBalance) {
        setZkdaiBalance(zkBalance);
        const publicBalance = await asset.balanceOfLinkedToken(account);
        setDaiBalance(publicBalance.toString(10));
      }

      if (zkAsset) zkAsset.unsubscribeToBalance(updateBalances)
      // Fetch the zkAsset
      const asset = await window.aztec.zkAsset(address);

      setZkAsset(asset);
      console.log('ASSET:', asset);
      
      // Initialise balances
      updateBalances(await asset.balance())
  
      // Update balances on each transfer of ZkAsset
      asset.subscribeToBalance(updateBalances)
  }

  useEffect(() => {
    async function initialiseAztec() {
      const account = await window.aztec.enable({
        contractAddresses: {
          ACE: addresses.ACE
        },
        apiKey: 'test1234', // API key for use with GSN for free txs.
      });
      if (account) {
        console.log("Initialised AZTEC");
        updateZkAsset(Object.keys(zkAssets)[0]);
      }
  
    }
    initialiseAztec();
  }, [zkAssets, account, addresses]);

  useEffect(() => {
    async function init() {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const streamContract = new web3.eth.Contract(
        abis.AztecStreamer,
        addresses.AztecStreamer,
      );
      setStreamContractInstance(streamContract);
    }
    init();
  }, [addresses.AztecStreamer]);

  return (
    <ApolloProvider client={client}>
      <AppBar position="static">
          <Toolbar>
            <LocalAtmIcon className={classes.icon}/>
            <Typography variant="h6" className={classes.title}>
              Quachtli
            </Typography>
            {/* <Button className={classes.button} variant="contained" >Connect to Wallet</Button> */}
          </Toolbar>
        </AppBar>
      <main className={classes.layout}>
        <Grid
          container
          direction="row"
          spacing={3}
        >
          <Grid
            item
            container
            direction="column"
            justify="flex-start"
            // alignContent="stretch"
            // alignItems="stretch"
            spacing={3}
            xs={6}
          >
          <Grid item>
           <Paper className={`${classes.pageElement} ${classes.paper}`}>
            <Typography variant="h5" gutterBottom>
              Select ZkAsset
            </Typography>
            <TextField
              select
              label="zkAsset"
              value={zkAsset ? zkAsset.address : undefined}
              onChange={val => updateZkAsset(val.target.value)}
              SelectProps={{
                native: true,
              }}
              variant="filled"
              fullWidth
              // className={classes.formControl}
            >
              {Object.entries(zkAssets).map(([address, metadata]) => (
                  <option key={address} value={address}>
                    {metadata.symbol}
                  </option>
              ))}
            </TextField>
          </Paper>
        </Grid>
            <Grid item>
              <Paper className={`${classes.pageElement} ${classes.paper}`}>
                <Typography variant="h5" gutterBottom>
                  Deposit DAI for ZkDAI
                </Typography>
                <Deposit
                  userAddress={account}
                  zkAsset={zkAsset}
                  streamContractAddress={addresses.AztecStreamer}
                  daiBalance={daiBalance}
                  zkdaiBalance={zkdaiBalance}
                />
              </Paper>
            </Grid>
            <Grid item>
              <Paper className={`${classes.pageElement} ${classes.paper}`}>
                <Typography variant="h5" gutterBottom>
                  Create a private stream
                </Typography>
                <Create
                  userAddress={account}
                  zkAsset={zkAsset}
                  streamContractAddress={addresses.AztecStreamer}
                  streamContractInstance={streamContractInstance}
                />
              </Paper>
            </Grid>
          </Grid>
          
          <Grid item xs={6} className={classes.pageElement}>
            <AppBar position="static">
            <Tabs value={value} onChange={(event, newValue) => setValue(newValue)} variant="fullWidth">
              <Tab label="Sending"  />
              <Tab label="Receiving"  />
            </Tabs>
          </AppBar>
            <Paper className={classes.paper}>
              <TabPanel value={value} index={0}>
                <Status
                    role="sender"
                    userAddress={account}
                    aztec={window.aztec}
                    streamContractInstance={streamContractInstance}
                    zkdaiBalance={zkdaiBalance}
                  />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Status
                    role="recipient"
                    userAddress={account}
                    aztec={window.aztec}
                    streamContractInstance={streamContractInstance}
                    zkdaiBalance={zkdaiBalance}
                  />
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </main>
    </ApolloProvider>
  );
};

export default App;
