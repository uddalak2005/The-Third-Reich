import keyVaultController from '../controllers/key.controller';
import express from 'express';

const router = express.Router();

router.post('/registerKey', keyVaultController.createKey);
router.get('/getKeys', keyVaultController.getKeys);
router.get('/get/:id', keyVaultController.getOne);
router.post('/revoke/:id', keyVaultController.revoke);

router.post('/callApi', keyVaultController.executeInEnclave);

router.post('/getKeys', keyVaultController.getUserKeys);

export default router;
