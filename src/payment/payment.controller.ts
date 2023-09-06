import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import axios from 'axios';
import { Configure, createCCAvenuePaymentRequest } from 'node-ccavenue';
import { decrypt, encrypt } from 'src/utils';
import qs from 'querystring';

const ccavenue = require('ccavenue');
// const ccav = new Configure({
// merchant_id: 2617540,
// working_key: '7C1653AB9CBA22FC7620D7CB8243D40F',
// access_code: 'AVUA91KG26BY46AUYB',
// });

@Controller('payment')
export class PaymentController {
  @Get()
  async makePayment(@Req() req, @Res() res) {
    try {
      // Prepare order parameters
      const orderParams = {
        merchant_id: 2617540,
        order_id: 8765432,
        currency: 'INR',
        amount: '10',
        redirect_url: `http://localhost:3000/payment/response`, // Change to the correct response URL
        cancel_url: `http://localhost:3000/payment/response`, // Change to the correct cancel URL
        billing_name: 'Customer',
        language: 'EN',
      };
    } catch (error) {
      console.error('Payment request error:', error);
      return res.status(500).json({ error: 'Payment request error' });
    }
  }

  @Post('/response')
  async temp(@Body() body, @Req() req, @Res() res) {
    console.log('body : ', body);
    console.log('req : ', req);
  }

  @Post()
  async makeReq(@Body() body, @Req() req, @Res() res) {
    try {
      const workingKey = '7C1653AB9CBA22FC7620D7CB8243D40F'; // Put in the 32-Bit Key provided by CCAvenue.
      // const workingKey = '1234567890123456'; // Replace with your 32-bit key

      const accessCode = 'AVUA91KG26BY46AUYB'; // Put in the Access Code provided by CCAvenue.
      const encRequest = encrypt(JSON.stringify(body), workingKey);

      // Prepare JSON response
      const jsonResponse = {
        encRequest: encRequest,
        accessCode: accessCode,
        // data:
        //   '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
        //   encRequest +
        //   '"><input type="hidden" name="access_code" id="access_code" value="' +
        //   accessCode +
        //   '"><script language="javascript">document.redirect.submit();</script></form>',
      };

      // axios.post(
      //   { url: ccAvenueUrl, form: formData },
      //   (error, response, body) => {
      //     if (error) {
      //       console.error(error);
      //       res.status(500).send('Payment failed');
      //     } else {
      //       // Redirect the user to CCAvenue for payment
      //       res.send(body);
      //     }
      //   },
      // );

      const resp = await axios.post(
        'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
        encRequest,
      );
      console.log(resp);

      return res.status(200).json(resp.data);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  }

  @Post('temp')
  async respond(@Body() body, @Req() req, @Res() res) {
    try {
      const workingKey = '7C1653AB9CBA22FC7620D7CB8243D40F'; // Put in the 32-Bit Key provided by CCAvenue.

      let ccavEncResponse = '';

      ccavEncResponse = body.encResp;
      const ccavResponse = decrypt(ccavEncResponse, workingKey);

      // Parse the decrypted response into JSON
      // const jsonResponse = qs.parse(ccavResponse);

      res.status(200).json(ccavResponse);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  }
}
