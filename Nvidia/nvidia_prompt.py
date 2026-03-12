test
prompt1=""
prompt2=""

chain = ChatPromptTemplate.from_template(prompt1) | llm | RunnableLambda(lambda x:{"content":x.content}) |ChatPromptTemplate.from_template(prompt2) | llm | StrOutputParser()
run_assessment(chain)


prompt1='''\
For each of the following customer feedback emails, sort out the customer's sentiment (positive/negative), related products, and store location.
Output in the following format:
1. Sentiment, product, location
The following are the emails to be sorted:
{emails}
'''

prompt2 ='''
Reply the product category with the most negative sentiment and which store location has the most complaints
For example, if there is one complaint about shirts, one complaint about jackets, and one complaint about jeans, then we can say there are 3 complaints about clothing 
If there is one complaint about a table and one complaint about a sofa, then we can say there are two complaints about furniture.
The output format is as follows:
The product category with the most negative sentiment is clothing.
The store location with the most negative sentiment is Dallas.
The following are the content to be sorted: {content}
'''
chain = ChatPromptTemplate.from_template(prompt1) | llm | RunnableLambda(lambda x:{"content":x.content}) |ChatPromptTemplate.from_template(prompt2) | llm | StrOutputParser()
chain.invoke(emails)
'To determine the product category with the most negative sentiment and the store location with the most complaints, we need to categorize the complaints by product category and store location.\n\nProduct Categories:\n- Clothing: 0\n- Furniture: 4 (Dining Table, Couch, Bookshelf, Bed Frame)\n- Kitchen Appliances: 2 (Blender, Coffee Maker)\n- Electronics: 1 (Headphones)\n- Home Decor: 1 (Air Fryer)\n- Furniture: 1 (Recliner Chair)\n\nThe product category with the most negative sentiment is Furniture.\n\nStore Locations:\n- New York: 5 (Dining Table, Couch, Bookshelf, Bed Frame, Blender)\n- Dallas: 2 (Sneakers, Air Fryer)\n- Oakland: 1 (Coffee Maker, Recliner Chair)\n- No store location mentioned: 1 (Headphones)\n\nThe store location with the most complaints is New York.'
run_assessment(chain)
