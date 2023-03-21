/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    let usuario = document.getElementById('usuario').value
    let password = document.getElementById('password').value

    document.getElementById('ingresar').addEventListener('click', (event) => {
        alert(JSON.stringify({ usuario, password }))

        let data = {
            "correo_usuario": usuario,
            "password_usuario": password
        }

        
        fetch('http://localhost:3000/api/auth/login', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-type": "application/json; charset=UTF-8"}
          })
          .then(response => response.json()) 
          .then(json => console.log(json))
          .catch(err => console.log(err));

    
    }, false)
}

