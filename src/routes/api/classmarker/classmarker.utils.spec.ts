import { config } from 'dotenv'
import { CLASSMARKER_SIGNATURE_HEADER, computeHmac, verifyData, } from './classmarker.utils';
import { CLASSMARKER_SECRET } from "../../../constants";

describe('Classmarker Utils', () => {
    const testBody = {"payload_type":"single_user_test_results_link","payload_status":"verify","test":{"test_id":100,"test_name":"Sample Test Name"},"link":{"link_id":101,"link_name":"Sample Link Name","link_url_id":"sample_quiz_id_123"},"result":{"link_result_id":8127364,"first":"John","last":"Smith","email":"john@example.com","percentage":80,"points_scored":8,"points_available":10,"requires_grading":"No","time_started":1436263522,"time_finished":1436264122,"duration":"00:05:20","percentage_passmark":70,"passed":true,"feedback":"Thanks for completing our Exam!","give_certificate_only_when_passed":false,"certificate_url":"https://www.classmarker.com/pdf/certificate/SampleCertificate.pdf","certificate_serial":"CLPPYQSBSY-ZZVKJGQH-XHWMMRCHYT","view_results_url":"","access_code_question":"What is your Employee ID?","access_code_used":"12345","extra_info_question":"Which sales department are you assigned to?","extra_info_answer":"New York Product 7 Divisiaon","extra_info2_question":"Extra Information Question 2 here","extra_info2_answer":"Extra Information Answer 2 here","extra_info3_question":"Extra Information Question 3 here","extra_info3_answer":"Extra Information Answer 3 here","extra_info4_question":"Extra Information Question 4 here","extra_info4_answer":"Extra Information Answer 4 here","extra_info5_question":"Extra Information Question 5 here","extra_info5_answer":"Extra Information Answer 5 here","cm_user_id":"123456","ip_address":"192.168.0.1"}}

    beforeAll(() => config())
    
    describe('verifyData', () => {
        describe('setup', () => {
            it('should have signature header defined', () => {
                expect(CLASSMARKER_SIGNATURE_HEADER).toBeDefined()
            })
    
            it('should have secret defined', () => {
                expect(CLASSMARKER_SECRET).toBeDefined()
            })
        })

        describe('computeHmac', () => {
            it('should generate signature', () => {
                const signature = computeHmac(testBody, CLASSMARKER_SECRET)
    
                expect(signature).toEqual('fzQBEAdYPDffbeIceUKstvtvBqMwMNg548zQyt4X6tI=')            
            })
        })

        describe('verifyData', () => {
            it('should identify incorrect signature', () => {
                const output = verifyData(testBody, 'xxx', CLASSMARKER_SECRET)
        
                expect(output).toBe(false)
            })
            
            it('should generate and verify test signature', () => {
                const signature = 'fzQBEAdYPDffbeIceUKstvtvBqMwMNg548zQyt4X6tI='
                
                const output = verifyData(testBody, signature, CLASSMARKER_SECRET)
                
                expect(output).toBe(true)
            })

            it('should generate and verify live signature', () => {
                const liveBody = {"payload_type":"single_user_test_results_link","payload_status":"live","test":{"test_id":1689290,"test_name":"neo4j-certified-professional"},"link":{"link_id":1026841,"link_name":"neo4j-certified-professional","link_url_id":"mx46047d6140f6e5"},"result":{"link_result_id":69943585,"first":"Merry","last":"George","email":"merry18star@gmail.com","percentage":59,"points_scored":61.9,"points_available":105,"requires_grading":"No","time_started":1659344044,"time_finished":1659347453,"duration":"00:56:49","percentage_passmark":"80","passed":false,"feedback":"Sorry but you were not successful. Feel free to take the certification again at a later time.\u00a0<br \/>\r\n<br \/>\r\n<br \/>\r\nYou might want to learn more about Neo4j. Here are some available online resources.<br \/>\r\n<br \/>\r\n<br \/>\r\nFree training courses at GraphAcademy:<br \/>\r\n<br \/>\r\n<a href=\"https:\/\/graphacademy.neo4j.com\/courses\/neo4j-fundamentals\/\" class=\"popup\">Neo4j Fundamentals<\/a><br \/>\r\n<br \/>\r\n<a href=\"https:\/\/graphacademy.neo4j.com\/courses\/cypher-fundamentals\/\" class=\"popup\">Cypher Fundamentals<\/a><br \/>\r\n<br \/>\r\n<a href=\"https:\/\/graphacademy.neo4j.com\/courses\/modeling-fundamentals\/\" class=\"popup\">Graph Data Modeling Fundamentals<\/a><br \/>\r\n<br \/>\r\n<a href=\"https:\/\/graphacademy.neo4j.com\/courses\/importing-data\/\" class=\"popup\">Importing CSV Data into Neo4j<\/a><br \/>\r\n<br \/>\r\n<a href=\"https:\/\/graphacademy.neo4j.com\/courses\/cypher-intermediate-queries\/\" class=\"popup\">Intermediate Cypher Queries<\/a><br \/>\r\n<br \/>\r\nAny one of the Building Neo4j Application courses at\u00a0<a href=\"https:\/\/graphacademy.neo4j.com\/\" class=\"popup\">GraphAcademy<\/a><br \/>\r\n<br \/>\r\n<br \/>\r\nOr use these resources for reference:<br \/>\r\n<br \/>\r\n<a href=\"https:\/\/neo4j.com\/docs\/cypher-manual\/current\/\" class=\"popup\">Cypher Reference Manual<\/a><br \/>\r\n<br \/>\r\n<a href=\"https:\/\/neo4j.com\/docs\/cypher-refcard\/current\/\" class=\"popup\">Cypher Refcard<\/a>","give_certificate_only_when_passed":false,"certificate_url":"","certificate_serial":"","view_results_url":"","access_code_question":"","access_code_used":"","extra_info_question":"","extra_info_answer":"","extra_info2_question":"","extra_info2_answer":"","extra_info3_question":"","extra_info3_answer":"","extra_info4_question":"","extra_info4_answer":"","extra_info5_question":"","extra_info5_answer":"","cm_user_id":"google-oauth2|109646298985314913724","ip_address":"2401:4900:1f26:2d4d:70eb:71e9:c028:7b35"}}
                const signature = 'zdhnLJdTyAaJi6W8Gov6IKPG5pp7w4kpPvSw1nshxFI='

                const generatedSignature = computeHmac(liveBody, CLASSMARKER_SECRET)
                const verified = verifyData(liveBody, signature, CLASSMARKER_SECRET)

                expect(generatedSignature).toEqual(signature)
                expect(verified).toEqual(true)
            })
        })
    })
})
