from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = Options()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)

try:
    print("Loading page...")
    driver.get("http://localhost:8081/testclient-ko.html")
    
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[value="teambuilder"]'))).click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.NAME, 'newTop'))).click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.NAME, 'addPokemon'))).click()
    
    pokemon_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.NAME, 'pokemon')))
    pokemon_input.send_keys("망나뇽")
    pokemon_input.submit() # doesn't always work, let's find the first result
    
    time.sleep(1) # wait for search
    
    first_result = driver.find_element(By.CSS_SELECTOR, '.result a')
    first_result.click()
    
    time.sleep(2) # wait for render
    
    setchart = driver.find_element(By.CSS_SELECTOR, '.setchart')
    print("--- SETCHART HTML ---")
    print(setchart.get_attribute('outerHTML'))
    print("---------------------")

except Exception as e:
    print(e)
finally:
    driver.quit()
