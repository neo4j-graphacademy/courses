import { config } from 'dotenv'
import { CLASSMARKER_SIGNATURE_HEADER, computeHmac, verifyData, } from './classmarker.utils';
import { CLASSMARKER_SECRET } from "../../../constants";

describe('Classmarker Utils', () => {
    const testBody = {"payload_type":"single_user_test_results_link","payload_status":"verify","test":{"test_id":100,"test_name":"Sample Test Name"},"link":{"link_id":101,"link_name":"Sample Link Name","link_url_id":"sample_quiz_id_123"},"result":{"link_result_id":8127364,"first":"John","last":"Smith","email":"john@example.com","percentage":80,"points_scored":8,"points_available":10,"requires_grading":"No","time_started":1436263522,"time_finished":1436264122,"duration":"00:05:20","percentage_passmark":70,"passed":true,"feedback":"Thanks for completing our Exam!","give_certificate_only_when_passed":false,"certificate_url":"https://www.classmarker.com/pdf/certificate/SampleCertificate.pdf","certificate_serial":"CLPPYQSBSY-ZZVKJGQH-XHWMMRCHYT","view_results_url":"","access_code_question":"What is your Employee ID?","access_code_used":"12345","extra_info_question":"Which sales department are you assigned to?","extra_info_answer":"New York Product 7 Divisiaon","extra_info2_question":"Extra Information Question 2 here","extra_info2_answer":"Extra Information Answer 2 here","extra_info3_question":"Extra Information Question 3 here","extra_info3_answer":"Extra Information Answer 3 here","extra_info4_question":"Extra Information Question 4 here","extra_info4_answer":"Extra Information Answer 4 here","extra_info5_question":"Extra Information Question 5 here","extra_info5_answer":"Extra Information Answer 5 here","cm_user_id":"123456","ip_address":"192.168.0.1"}}
    const testSignature = 'YWT3YLAtp5HsSay3Sj7JPclgQIFl5r0oNV9lqex4kN0='

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
    
                expect(signature).toEqual(testSignature)
            })
        })

        describe('verifyData', () => {
            it('should identify incorrect signature', () => {
                const output = verifyData(testBody, 'xxx', CLASSMARKER_SECRET)
        
                expect(output).toBe(false)
            })
            
            it('should generate and verify test signature', () => {                
                const output = verifyData(testBody, testSignature, CLASSMARKER_SECRET)
                
                expect(output).toBe(true)
            })

            it('should generate and verify live signature', () => {
                const liveBody = {"payload_type":"single_user_test_results_link","payload_status":"live","test":{"test_id":1689290,"test_name":"neo4j-certified-professional"},"link":{"link_id":1026841,"link_name":"neo4j-certified-professional","link_url_id":"mx46047d6140f6e5"},"result":{"link_result_id":69790096,"first":"Adam","last":"Cowley","email":"adam.cowley@neotechnology.com","percentage":90.9,"points_scored":94.5,"points_available":104,"requires_grading":"No","time_started":1658858434,"time_finished":1658861428,"duration":"00:49:54","percentage_passmark":"80","passed":true,"feedback":"Thank you for submitting your Neo4j Certified Professional exam.  <br />\r\n<br />\r\nClick the &quot;Submit Your Test Results&quot; link to send your results to Neo4j.<br />\r\n<br />\r\nYour certificate link will be emailed to you shortly.","give_certificate_only_when_passed":false,"certificate_url":"","certificate_serial":"","view_results_url":"","access_code_question":"","access_code_used":"","extra_info_question":"","extra_info_answer":"","extra_info2_question":"","extra_info2_answer":"","extra_info3_question":"","extra_info3_answer":"","extra_info4_question":"","extra_info4_answer":"","extra_info5_question":"","extra_info5_answer":"","cm_user_id":"google-oauth2|113046196349780988147","ip_address":"86.19.70.54"}}
                const signature = '+CM9nH+6Y7hsvlbPde9xz0rAxN+RMhhsDvFPvMK+PpU='

                const generatedSignature = computeHmac(liveBody, CLASSMARKER_SECRET)
                const verified = verifyData(liveBody, signature, CLASSMARKER_SECRET)

                expect(generatedSignature).toEqual(signature)
                expect(verified).toEqual(true)
            })
        })
    })
})
