import fetch from 'node-fetch';
// import 'data:text/javascript';
// import { register } from 'node:module';
// import { pathToFileURL } from 'node:url';
// register('ts-node/esm', pathToFileURL('./'));

fetch('https://travel-landing-page-sandy.vercel.app/')
    .then(response => {
        const reader = response.body.getReader();
        function read() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    console.log('Selesai membaca stream.');
                    return;
                }
                console.log('Dapat chunk data:', value);
                read();
            });
        }
        read();
    })
    .catch(error => console.error('Terjadi error:', error));
